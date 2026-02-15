import { type Logger } from "pino";
import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import * as Rx from "rxjs";
import {
  DivorcePrivateStateId,
  DivorceProviders,
  DeployedDivorceContract,
  emptyState,
  UserAction,
  type DerivedState,
} from "./common-types";
import {
  Divorce,
  DivorcePrivateState,
} from "@eddalabs/divorce-settlement-contract";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import { PrivateStateProvider } from "@midnight-ntwrk/midnight-js-types";
import { CompiledContract } from "@midnight-ntwrk/compact-js";

const divorceCompiledContract = CompiledContract.make(
  "divorce",
  Divorce.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(
    `${window.location.origin}/midnight/divorce`,
  ),
);

export interface ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  confirmByPartyA: () => Promise<void>;
  confirmByPartyB: () => Promise<void>;
  finalizeSettlement: () => Promise<void>;
}

export class ContractController implements ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  readonly privateStates$: Rx.Subject<DivorcePrivateState>;
  readonly turns$: Rx.Subject<UserAction>;

  private constructor(
    public readonly contractPrivateStateId: typeof DivorcePrivateStateId,
    public readonly deployedContract: DeployedDivorceContract,
    public readonly providers: DivorceProviders,
    private readonly logger: Logger,
  ) {
    const combine = (_acc: DerivedState, value: DerivedState): DerivedState => {
      return {
        isSettled: value.isSettled,
        partyAConfirmed: value.partyAConfirmed,
        partyBConfirmed: value.partyBConfirmed,
        privateState: value.privateState,
        turns: value.turns,
      };
    };
    this.deployedContractAddress =
      deployedContract.deployTxData.public.contractAddress;
    this.turns$ = new Rx.Subject<UserAction>();
    this.privateStates$ = new Rx.Subject<DivorcePrivateState>();
    this.state$ = Rx.combineLatest(
      [
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, {
            type: "all",
          })
          .pipe(Rx.map((contractState) => Divorce.ledger(contractState.data))),
        Rx.concat(
          Rx.from(
            Rx.defer(
              () =>
                providers.privateStateProvider.get(
                  contractPrivateStateId,
                ) as Promise<DivorcePrivateState>,
            ),
          ),
          this.privateStates$,
        ),
        Rx.concat(
          Rx.of<UserAction>({
            confirmByPartyA: undefined,
            confirmByPartyB: undefined,
            finalizeSettlement: undefined,
          }),
          this.turns$,
        ),
      ],
      (ledgerState, privateState, userActions) => {
        const result: DerivedState = {
          isSettled: ledgerState.isSettled,
          partyAConfirmed: ledgerState.partyAConfirmed,
          partyBConfirmed: ledgerState.partyBConfirmed,
          privateState: privateState,
          turns: userActions,
        };
        return result;
      },
    ).pipe(
      Rx.scan(combine, emptyState),
      Rx.retry({
        delay: 500,
      }),
    );
  }

  /**
   * Query on-chain state to check a specific ledger field value.
   * Used both as a pre-flight check and for post-failure verification.
   */
  private async checkOnChainState(
    field: "partyAConfirmed" | "partyBConfirmed" | "isSettled",
    expectedValue: bigint,
  ): Promise<boolean> {
    try {
      const contractState =
        await this.providers.publicDataProvider.queryContractState(
          this.deployedContractAddress,
        );
      if (contractState) {
        const ledgerState = Divorce.ledger(contractState.data);
        return ledgerState[field] === expectedValue;
      }
    } catch (queryErr) {
      console.warn("[DST] checkOnChainState: query failed", queryErr);
    }
    return false;
  }

  /**
   * After a callTx failure, poll the on-chain state to see if the
   * transaction actually succeeded. The wallet may have signed & submitted
   * the tx (debiting tDust) but the confirmation step timed out.
   */
  private async verifyStateAfterFailure(
    expectedField: "partyAConfirmed" | "partyBConfirmed" | "isSettled",
    expectedValue: bigint,
    maxAttempts = 12,
    intervalMs = 5000,
  ): Promise<boolean> {
    console.log(
      `[DST] verifyStateAfterFailure: polling ${expectedField} for up to ${(maxAttempts * intervalMs) / 1000}s...`,
    );
    for (let i = 0; i < maxAttempts; i++) {
      const matched = await this.checkOnChainState(
        expectedField,
        expectedValue,
      );
      if (matched) {
        console.log(
          `[DST] verifyStateAfterFailure: ${expectedField} is now ${expectedValue} — tx succeeded on-chain (poll ${i + 1})`,
        );
        return true;
      }
      if (i < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }
    console.log(
      `[DST] verifyStateAfterFailure: ${expectedField} did not reach ${expectedValue} after ${maxAttempts} polls`,
    );
    return false;
  }

  async confirmByPartyA(): Promise<void> {
    this.logger?.info("Confirming compliance as Party A");
    console.log("[DST] confirmByPartyA: starting...");

    // Pre-flight: if a previous tx already succeeded on-chain, skip
    const alreadyConfirmed = await this.checkOnChainState(
      "partyAConfirmed",
      1n,
    );
    if (alreadyConfirmed) {
      console.log(
        "[DST] confirmByPartyA: already confirmed on-chain, skipping tx",
      );
      this.logger?.info("confirmByPartyA: already confirmed on-chain");
      return;
    }

    this.turns$.next({
      confirmByPartyA: "Confirming as Party A...",
      confirmByPartyB: undefined,
      finalizeSettlement: undefined,
    });

    try {
      console.time("[DST] confirmByPartyA");
      const txData = await this.deployedContract.callTx.confirmByPartyA(1n);
      console.timeEnd("[DST] confirmByPartyA");
      this.logger?.trace({
        confirmByPartyA: {
          message: "Party A confirmed compliance",
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
    } catch (e) {
      console.error("[DST] confirmByPartyA failed:", e);
      // Always verify on-chain state — tDust may have been debited even if
      // the SDK reports a failure (wallet signed but later step failed)
      console.log(
        "[DST] confirmByPartyA: error occurred, verifying on-chain state...",
      );
      this.turns$.next({
        confirmByPartyA: "Verifying on-chain state...",
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
      const succeeded = await this.verifyStateAfterFailure(
        "partyAConfirmed",
        1n,
      );
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
      if (succeeded) {
        this.logger?.info(
          "confirmByPartyA: tx confirmed via state verification",
        );
        return;
      }
      throw e;
    }
  }

  async confirmByPartyB(): Promise<void> {
    this.logger?.info("Confirming compliance as Party B");
    console.log("[DST] confirmByPartyB: starting...");

    // Pre-flight: if a previous tx already succeeded on-chain, skip
    const alreadyConfirmed = await this.checkOnChainState(
      "partyBConfirmed",
      1n,
    );
    if (alreadyConfirmed) {
      console.log(
        "[DST] confirmByPartyB: already confirmed on-chain, skipping tx",
      );
      this.logger?.info("confirmByPartyB: already confirmed on-chain");
      return;
    }

    this.turns$.next({
      confirmByPartyA: undefined,
      confirmByPartyB: "Confirming as Party B...",
      finalizeSettlement: undefined,
    });

    try {
      console.time("[DST] confirmByPartyB");
      const txData = await this.deployedContract.callTx.confirmByPartyB(1n);
      console.timeEnd("[DST] confirmByPartyB");
      this.logger?.trace({
        confirmByPartyB: {
          message: "Party B confirmed compliance",
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
    } catch (e) {
      console.error("[DST] confirmByPartyB failed:", e);
      console.log(
        "[DST] confirmByPartyB: error occurred, verifying on-chain state...",
      );
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: "Verifying on-chain state...",
        finalizeSettlement: undefined,
      });
      const succeeded = await this.verifyStateAfterFailure(
        "partyBConfirmed",
        1n,
      );
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
      if (succeeded) {
        this.logger?.info(
          "confirmByPartyB: tx confirmed via state verification",
        );
        return;
      }
      throw e;
    }
  }

  async finalizeSettlement(): Promise<void> {
    this.logger?.info("Finalizing settlement");
    console.log("[DST] finalizeSettlement: starting...");

    // Pre-flight: if a previous tx already succeeded on-chain, skip
    const alreadySettled = await this.checkOnChainState("isSettled", 1n);
    if (alreadySettled) {
      console.log(
        "[DST] finalizeSettlement: already settled on-chain, skipping tx",
      );
      this.logger?.info("finalizeSettlement: already settled on-chain");
      return;
    }

    this.turns$.next({
      confirmByPartyA: undefined,
      confirmByPartyB: undefined,
      finalizeSettlement: "Finalizing settlement...",
    });

    try {
      console.time("[DST] finalizeSettlement");
      const txData = await this.deployedContract.callTx.finalizeSettlement();
      console.timeEnd("[DST] finalizeSettlement");
      this.logger?.trace({
        finalizeSettlement: {
          message: "Settlement finalized",
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
    } catch (e) {
      console.error("[DST] finalizeSettlement failed:", e);
      console.log(
        "[DST] finalizeSettlement: error occurred, verifying on-chain state...",
      );
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: "Verifying on-chain state...",
      });
      const succeeded = await this.verifyStateAfterFailure("isSettled", 1n);
      this.turns$.next({
        confirmByPartyA: undefined,
        confirmByPartyB: undefined,
        finalizeSettlement: undefined,
      });
      if (succeeded) {
        this.logger?.info(
          "finalizeSettlement: tx confirmed via state verification",
        );
        return;
      }
      throw e;
    }
  }

  static async deploy(
    contractPrivateStateId: typeof DivorcePrivateStateId,
    providers: DivorceProviders,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      deployContract: {
        action: "Deploying divorce settlement contract",
        contractPrivateStateId,
        providers,
      },
    });
    const deployedContract = await deployContract(providers, {
      compiledContract: divorceCompiledContract,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(
        contractPrivateStateId,
        providers.privateStateProvider,
      ),
    });

    logger.trace({
      contractDeployed: {
        action: "Contract was deployed",
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(
      contractPrivateStateId,
      deployedContract,
      providers,
      logger,
    );
  }

  static async join(
    contractPrivateStateId: typeof DivorcePrivateStateId,
    providers: DivorceProviders,
    contractAddress: ContractAddress,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      joinContract: {
        action: "Joining divorce settlement contract",
        contractPrivateStateId,
        contractAddress,
      },
    });

    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      compiledContract: divorceCompiledContract,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(
        contractPrivateStateId,
        providers.privateStateProvider,
      ),
    });

    logger.trace({
      contractJoined: {
        action: "Joined the contract successfully",
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(
      contractPrivateStateId,
      deployedContract,
      providers,
      logger,
    );
  }

  private static async getPrivateState(
    divorcePrivateStateId: typeof DivorcePrivateStateId,
    privateStateProvider: PrivateStateProvider<
      typeof DivorcePrivateStateId,
      DivorcePrivateState
    >,
  ): Promise<DivorcePrivateState> {
    const existingPrivateState = await privateStateProvider.get(
      divorcePrivateStateId,
    );
    const initialState = await this.getOrCreateInitialPrivateState(
      divorcePrivateStateId,
      privateStateProvider,
    );
    return existingPrivateState ?? initialState;
  }

  static async getOrCreateInitialPrivateState(
    divorcePrivateStateId: typeof DivorcePrivateStateId,
    privateStateProvider: PrivateStateProvider<
      typeof DivorcePrivateStateId,
      DivorcePrivateState
    >,
  ): Promise<DivorcePrivateState> {
    let state = await privateStateProvider.get(divorcePrivateStateId);

    if (state === null) {
      state = {} as DivorcePrivateState;
      await privateStateProvider.set(divorcePrivateStateId, state);
    }
    return state;
  }
}
