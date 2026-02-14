// Divorce Settlement Tracker - no private state needed
// All privacy is handled by the ZK circuits (private witnesses as circuit arguments)
export type DivorcePrivateState = Record<string, never>;

export const createPrivateState = (): DivorcePrivateState => ({});

export const witnesses = {};
