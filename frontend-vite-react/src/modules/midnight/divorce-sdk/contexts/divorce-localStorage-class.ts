import type { Logger } from "pino";

export interface LocalStorageProps {
  readonly addContract: (contract: string) => void;
  readonly getContracts: () => string[];
}

export class LocalStorage implements LocalStorageProps {
  constructor(private readonly logger: Logger) {}

  addContract(contract: string): void {
    this.logger.trace(`Adding contract ${contract}`);
    const item = window.localStorage.getItem("divorce_contracts");
    const contracts: string[] = item ? JSON.parse(item) : [];
    const updatedContracts = Array.from(new Set([...contracts, contract]));
    window.localStorage.setItem(
      "divorce_contracts",
      JSON.stringify(updatedContracts),
    );
  }

  getContracts(): string[] {
    const item = window.localStorage.getItem("divorce_contracts");
    const contracts: string[] = item ? JSON.parse(item) : [];
    return Array.from<string>(new Set([...contracts]));
  }
}
