import * as ledger from "@midnight-ntwrk/ledger-v7";
import {
  type MidnightProvider,
  type WalletProvider,
  type UnboundTransaction,
  PrivateStateProvider,
  ZKConfigProvider,
  ProofProvider,
  PublicDataProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { createContext, useCallback, useMemo, useState } from "react";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { Logger } from "pino";
import type {
  DivorceCircuits,
  DivorcePrivateStateId,
} from "../api/common-types";
import { DivorceProviders } from "../api/common-types";
import { useWallet } from "../../wallet-widget/hooks/useWallet";
import {
  ActionMessages,
  ProviderAction,
  WrappedPublicDataProvider,
} from "../../wallet-widget/utils/providersWrappers/publicDataProvider";
import { CachedFetchZkConfigProvider } from "../../wallet-widget/utils/providersWrappers/zkConfigProvider";
import {
  noopProofClient,
  proofClient,
} from "../../wallet-widget/utils/providersWrappers/proofClient";
import { inMemoryPrivateStateProvider } from "../../wallet-widget/utils/customImplementations/in-memory-private-state-provider";
import { DivorcePrivateState } from "@eddalabs/divorce-settlement-contract";
import { fromHex, toHex } from "@midnight-ntwrk/compact-runtime";

export interface ProvidersState {
  privateStateProvider: PrivateStateProvider<typeof DivorcePrivateStateId>;
  zkConfigProvider?: ZKConfigProvider<DivorceCircuits>;
  proofProvider: ProofProvider;
  publicDataProvider?: PublicDataProvider;
  walletProvider?: WalletProvider;
  midnightProvider?: MidnightProvider;
  providers?: DivorceProviders;
  flowMessage?: string;
}

interface ProviderProps {
  children: React.ReactNode;
  logger: Logger;
}

export const ProvidersContext = createContext<ProvidersState | undefined>(
  undefined,
);

const ACTION_MESSAGES: Readonly<ActionMessages> = {
  proveTxStarted: "Proving transaction...",
  proveTxDone: undefined,
  balanceTxStarted: "Signing the transaction with Midnight Lace wallet...",
  balanceTxDone: undefined,
  downloadProverStarted: "Downloading prover key...",
  downloadProverDone: undefined,
  submitTxStarted: "Submitting transaction...",
  submitTxDone: undefined,
  watchForTxDataStarted:
    "Waiting for transaction finalization on blockchain...",
  watchForTxDataDone: undefined,
} as const;

export const Provider = ({ children, logger }: ProviderProps) => {
  const [flowMessage, setFlowMessage] = useState<string | undefined>(undefined);

  const { serviceUriConfig, shieldedAddresses, connectedAPI, status } =
    useWallet();

  const providerCallback = useCallback((action: ProviderAction): void => {
    setFlowMessage(ACTION_MESSAGES[action]);
  }, []);

  const privateStateProvider: PrivateStateProvider<
    typeof DivorcePrivateStateId
  > = useMemo(
    () => inMemoryPrivateStateProvider<string, DivorcePrivateState>(),
    [logger, status],
  );

  const publicDataProvider: PublicDataProvider | undefined = useMemo(
    () =>
      serviceUriConfig
        ? new WrappedPublicDataProvider(
            indexerPublicDataProvider(
              serviceUriConfig.indexerUri,
              serviceUriConfig.indexerWsUri,
            ),
            providerCallback,
            logger,
          )
        : undefined,
    [serviceUriConfig, providerCallback, logger, status],
  );

  const zkConfigProvider = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    return new CachedFetchZkConfigProvider<DivorceCircuits>(
      `${window.location.origin}/midnight/divorce`,
      fetch.bind(window),
      providerCallback,
    );
  }, [status]);

  const proofProvider = useMemo(
    () =>
      serviceUriConfig?.proverServerUri && zkConfigProvider
        ? proofClient(
            serviceUriConfig.proverServerUri,
            zkConfigProvider,
            providerCallback,
          )
        : noopProofClient(),
    [serviceUriConfig, zkConfigProvider, providerCallback, status],
  );

  const walletProvider: WalletProvider = useMemo(
    () =>
      connectedAPI
        ? {
            getCoinPublicKey(): ledger.CoinPublicKey {
              return shieldedAddresses?.shieldedCoinPublicKey as unknown as ledger.CoinPublicKey;
            },
            getEncryptionPublicKey(): ledger.EncPublicKey {
              return shieldedAddresses?.shieldedEncryptionPublicKey as unknown as ledger.EncPublicKey;
            },
            async balanceTx(
              tx: UnboundTransaction,
              ttl?: Date,
            ): Promise<ledger.FinalizedTransaction> {
              const attemptBalance = async (
                attempt: number,
              ): Promise<ledger.FinalizedTransaction> => {
                try {
                  providerCallback("balanceTxStarted");

                  // Pre-flight: log wallet diagnostics
                  try {
                    const bal = await connectedAPI.getDustBalance();
                    console.log(
                      `[DST] balanceTx (attempt ${attempt}): wallet dust balance =`,
                      bal,
                    );
                    if (
                      bal &&
                      typeof bal.balance === "bigint" &&
                      bal.balance <= 0n
                    ) {
                      console.warn(
                        "[DST] balanceTx: wallet reports zero tDust balance!",
                      );
                    }
                  } catch (diagErr) {
                    console.warn(
                      "[DST] balanceTx: could not query dust balance:",
                      diagErr,
                    );
                  }

                  console.log(
                    `[DST] balanceTx (attempt ${attempt}): serializing transaction...`,
                  );
                  logger.info(
                    { ttl, attempt },
                    "Balancing transaction via wallet",
                  );
                  const serializedTx = toHex(tx.serialize());
                  console.log(
                    `[DST] balanceTx (attempt ${attempt}): sending to wallet for balancing... (tx size: ${serializedTx.length} chars)`,
                  );
                  const received =
                    await connectedAPI.balanceUnsealedTransaction(serializedTx);
                  console.log(
                    `[DST] balanceTx (attempt ${attempt}): wallet balanced, deserializing...`,
                  );
                  providerCallback("balanceTxDone");
                  return ledger.Transaction.deserialize<
                    ledger.SignatureEnabled,
                    ledger.Proof,
                    ledger.Binding
                  >("signature", "proof", "binding", fromHex(received.tx));
                } catch (e: unknown) {
                  console.error(
                    `[DST] balanceTx FAILED (attempt ${attempt}):`,
                    e,
                  );
                  console.error(
                    "[DST] balanceTx error details:",
                    JSON.stringify(e, Object.getOwnPropertyNames(e as object)),
                  );
                  providerCallback("balanceTxDone");
                  logger.error(
                    { error: e, attempt },
                    "Error balancing transaction via wallet",
                  );
                  throw e;
                }
              };

              // First attempt
              try {
                return await attemptBalance(1);
              } catch (firstError: unknown) {
                // Only retry for FiberFailure / opaque wallet errors.
                // These do NOT debit tDust (confirmed empirically).
                const errStr = String(firstError);
                const isFiberFailure =
                  errStr.includes("FiberFailure") ||
                  errStr.includes("fiber") ||
                  (firstError instanceof Error && !firstError.message);

                if (!isFiberFailure) {
                  // Non-FiberFailure errors (e.g. user cancelled, insufficient funds message) — don't retry
                  const wrappedError = new Error(
                    "Wallet failed to balance the transaction. " +
                      "This can happen if your wallet's coins are temporarily locked from a recent transaction, " +
                      "or if you don't have enough tDust. Wait a minute and try again.",
                  );
                  wrappedError.cause = firstError;
                  throw wrappedError;
                }

                // FiberFailure: likely locked UTXOs. Wait, refresh wallet state, then retry once.
                console.log(
                  "[DST] balanceTx: FiberFailure detected. Waiting 20s for UTXO lock release before retry...",
                );
                providerCallback("balanceTxStarted"); // keep the spinner visible
                await new Promise((r) => setTimeout(r, 20_000));

                try {
                  return await attemptBalance(2);
                } catch (retryError: unknown) {
                  const wrappedError = new Error(
                    "Wallet failed to balance the transaction after retry. " +
                      "This can happen if your wallet's coins are temporarily locked from a recent transaction, " +
                      "or if you don't have enough tDust. Try these steps:\n" +
                      "1. Wait 2-3 minutes for UTXO locks to expire\n" +
                      "2. Refresh the page\n" +
                      "3. Check your tDust balance in the Lace wallet\n" +
                      "4. Try disconnecting and reconnecting the wallet",
                  );
                  wrappedError.cause = retryError;
                  throw wrappedError;
                }
              }
            },
          }
        : {
            getCoinPublicKey(): ledger.CoinPublicKey {
              return "";
            },
            getEncryptionPublicKey(): ledger.EncPublicKey {
              return "";
            },
            balanceTx: () => Promise.reject(new Error("readonly")),
          },
    [connectedAPI, providerCallback, status],
  );

  const midnightProvider: MidnightProvider = useMemo(
    () =>
      connectedAPI
        ? {
            submitTx: async (
              tx: ledger.FinalizedTransaction,
            ): Promise<ledger.TransactionId> => {
              // Extract txId BEFORE submitting so we can return it even if
              // the wallet connector throws after the node already accepted the tx
              const txIdentifiers = tx.identifiers();
              const txId = txIdentifiers[0];
              try {
                providerCallback("submitTxStarted");
                console.log("[DST] submitTx: serializing transaction...");
                const serializedTx = toHex(tx.serialize());
                console.log(
                  "[DST] submitTx: submitting to wallet, txId:",
                  txId,
                );
                await connectedAPI.submitTransaction(serializedTx);
                logger.info(
                  { txIdentifiers },
                  "Submitted transaction via wallet",
                );
                console.log("[DST] submitTx: success, txId:", txId);
                providerCallback("submitTxDone");
                return txId;
              } catch (e: unknown) {
                // Gas was likely already debited if we got this far.
                // The wallet connector may throw even after successful submission.
                console.warn(
                  "[DST] submitTx threw after send (tx may have succeeded on-chain). txId:",
                  txId,
                  "Error:",
                  e,
                );
                logger.warn(
                  { error: e, txId },
                  "submitTx threw but tx may have been accepted — returning txId anyway",
                );
                providerCallback("submitTxDone");
                // Return the txId so the SDK can still watchForTxData
                return txId;
              }
            },
          }
        : {
            submitTx: (): Promise<ledger.TransactionId> =>
              Promise.reject(new Error("readonly")),
          },
    [connectedAPI, providerCallback, status],
  );

  const combinedProviders: ProvidersState = useMemo(() => {
    return {
      privateStateProvider,
      publicDataProvider,
      proofProvider,
      zkConfigProvider,
      walletProvider,
      midnightProvider,
      providers:
        publicDataProvider && zkConfigProvider
          ? {
              privateStateProvider,
              publicDataProvider,
              zkConfigProvider,
              proofProvider,
              walletProvider,
              midnightProvider,
            }
          : undefined,
      flowMessage,
    };
  }, [
    privateStateProvider,
    publicDataProvider,
    proofProvider,
    zkConfigProvider,
    walletProvider,
    midnightProvider,
    flowMessage,
  ]);

  return (
    <ProvidersContext.Provider value={combinedProviders}>
      {children}
    </ProvidersContext.Provider>
  );
};
