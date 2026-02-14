import { Divorce, type DivorcePrivateState } from '@eddalabs/divorce-settlement-contract';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';

export type DivorceCircuits = ImpureCircuitId<Divorce.Contract<DivorcePrivateState>>;

export const DivorcePrivateStateId = 'divorcePrivateState';

export type DivorceProviders = MidnightProviders<DivorceCircuits, typeof DivorcePrivateStateId, DivorcePrivateState>;

export type DivorceContract = Divorce.Contract<DivorcePrivateState>;

export type DeployedDivorceContract = DeployedContract<DivorceContract> | FoundContract<DivorceContract>;

export type DerivedState = {
  readonly isSettled: Divorce.Ledger['isSettled'];
  readonly partyAConfirmed: Divorce.Ledger['partyAConfirmed'];
  readonly partyBConfirmed: Divorce.Ledger['partyBConfirmed'];
};

export const emptyState: DerivedState = {
  isSettled: 0n,
  partyAConfirmed: 0n,
  partyBConfirmed: 0n,
};
