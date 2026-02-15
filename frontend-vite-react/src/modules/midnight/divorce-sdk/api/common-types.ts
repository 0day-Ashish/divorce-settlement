import {
  type DivorcePrivateState,
  Divorce,
} from "@eddalabs/divorce-settlement-contract";
import type { ImpureCircuitId } from "@midnight-ntwrk/compact-js";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import type {
  DeployedContract,
  FoundContract,
} from "@midnight-ntwrk/midnight-js-contracts";

export type DivorceCircuits = ImpureCircuitId<
  Divorce.Contract<DivorcePrivateState>
>;

export const DivorcePrivateStateId = "divorcePrivateState";

export type DivorceProviders = MidnightProviders<
  DivorceCircuits,
  typeof DivorcePrivateStateId,
  DivorcePrivateState
>;

export type DivorceContract = Divorce.Contract<DivorcePrivateState>;

export type DeployedDivorceContract =
  | DeployedContract<DivorceContract>
  | FoundContract<DivorceContract>;

export type UserAction = {
  confirmByPartyA: string | undefined;
  confirmByPartyB: string | undefined;
  finalizeSettlement: string | undefined;
};

export type DerivedState = {
  readonly isSettled: Divorce.Ledger["isSettled"];
  readonly partyAConfirmed: Divorce.Ledger["partyAConfirmed"];
  readonly partyBConfirmed: Divorce.Ledger["partyBConfirmed"];
  readonly privateState: DivorcePrivateState;
  readonly turns: UserAction;
};

export const emptyState: DerivedState = {
  isSettled: 0n,
  partyAConfirmed: 0n,
  partyBConfirmed: 0n,
  privateState: {} as DivorcePrivateState,
  turns: {
    confirmByPartyA: undefined,
    confirmByPartyB: undefined,
    finalizeSettlement: undefined,
  },
};
