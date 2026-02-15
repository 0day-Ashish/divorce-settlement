import { DeployedProvider } from "./divorce-deployment";
import { LocalStorageProvider } from "./divorce-localStorage";
import { Provider } from "./divorce-providers";
import { Logger } from "pino";
import { ContractAddress } from "@midnight-ntwrk/compact-runtime";

export * from "./divorce-providers";
export * from "./divorce-localStorage";
export * from "./divorce-localStorage-class";
export * from "./divorce-deployment";
export * from "./divorce-deployment-class";

interface AppProviderProps {
  children: React.ReactNode;
  logger: Logger;
  contractAddress: ContractAddress;
}

export const DivorceAppProvider = ({
  children,
  logger,
  contractAddress,
}: AppProviderProps) => {
  return (
    <LocalStorageProvider logger={logger}>
      <Provider logger={logger}>
        <DeployedProvider logger={logger} contractAddress={contractAddress}>
          {children}
        </DeployedProvider>
      </Provider>
    </LocalStorageProvider>
  );
};
