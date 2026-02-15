import { DerivedState } from "../api/common-types";
import { useCallback, useEffect, useState } from "react";
import { ContractControllerInterface } from "../api/contractController";
import { Observable } from "rxjs";
import { useWallet } from "../../wallet-widget/hooks/useWallet";
import { ContractDeployment, ContractFollow } from "../contexts";
import { useDeployedContracts } from "./use-deployment";
import { useProviders } from "./use-providers";

export type ContractJoinStatus = "idle" | "joining" | "joined" | "failed";

export const useContractSubscription = () => {
  const { status } = useWallet();
  const providers = useProviders();
  const deploy = useDeployedContracts();

  const [divorceDeploymentObservable, setDivorceDeploymentObservable] =
    useState<Observable<ContractDeployment> | undefined>(undefined);

  const [contractDeployment, setContractDeployment] =
    useState<ContractDeployment>();
  const [deployedContractAPI, setDeployedContractAPI] =
    useState<ContractControllerInterface>();
  const [derivedState, setDerivedState] = useState<DerivedState>();
  const [joinStatus, setJoinStatus] = useState<ContractJoinStatus>("idle");
  const [joinError, setJoinError] = useState<string | null>(null);

  const onDeploy = async (): Promise<ContractFollow> => {
    const contractFollow = await deploy.deployContract();
    setDivorceDeploymentObservable(contractFollow.observable);
    return contractFollow;
  };

  const onJoin = useCallback(async (): Promise<void> => {
    setJoinStatus("joining");
    setJoinError(null);
    console.log("[DST] onJoin: attempting to join contract...");
    setDivorceDeploymentObservable(deploy.joinContract().observable);
  }, [deploy, setDivorceDeploymentObservable]);

  const retryJoin = useCallback(async (): Promise<void> => {
    setDeployedContractAPI(undefined);
    setDerivedState(undefined);
    setContractDeployment(undefined);
    setDivorceDeploymentObservable(undefined);
    await onJoin();
  }, [onJoin]);

  useEffect(() => {
    if (status?.status === "connected" && providers) {
      void onJoin();
    }
  }, [onJoin, status?.status, providers]);

  useEffect(() => {
    if (!divorceDeploymentObservable) {
      return;
    }
    const subscription = divorceDeploymentObservable.subscribe(
      setContractDeployment,
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [divorceDeploymentObservable]);

  useEffect(() => {
    if (!contractDeployment) {
      return;
    }

    if (contractDeployment.status === "in-progress") {
      setJoinStatus("joining");
      return;
    }

    if (contractDeployment.status === "failed") {
      console.error(
        "[DST] Contract join/deploy failed:",
        contractDeployment.error,
      );
      setJoinStatus("failed");
      setJoinError(
        contractDeployment.error.message || "Failed to connect to contract",
      );
      return;
    }

    console.log(
      "[DST] Contract joined successfully, address:",
      contractDeployment.address,
    );
    setJoinStatus("joined");
    setJoinError(null);
    setDeployedContractAPI((prev) => prev || contractDeployment.api);
  }, [contractDeployment, setDeployedContractAPI]);

  useEffect(() => {
    if (deployedContractAPI) {
      const subscriptionDerivedState =
        deployedContractAPI.state$.subscribe(setDerivedState);
      return () => {
        subscriptionDerivedState.unsubscribe();
      };
    }
  }, [deployedContractAPI]);

  return {
    deployedContractAPI,
    derivedState,
    onDeploy,
    providers,
    joinStatus,
    joinError,
    retryJoin,
  };
};
