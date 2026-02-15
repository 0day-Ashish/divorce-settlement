import { useEffect, useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Scale,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Coins,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractSubscription } from "@/modules/midnight/divorce-sdk/hooks/use-contract-subscription";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";

export const Settlement = () => {
  const {
    deployedContractAPI,
    derivedState,
    onDeploy,
    joinStatus,
  } = useContractSubscription();
  const { status, dustBalance, proofServerOnline, refresh } = useWallet();
  const [deployedAddress, setDeployedAddress] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletRefreshing, setWalletRefreshing] = useState(false);

  const isConnected = status?.status === "connected";
  const isSettled = derivedState?.isSettled === 1n;
  const partyAConfirmed = derivedState?.partyAConfirmed === 1n;
  const partyBConfirmed = derivedState?.partyBConfirmed === 1n;

  const deployNew = async () => {
    setLoading(true);
    setError(null);
    try {
      const { address } = await onDeploy();
      setDeployedAddress(address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deployment failed");
    }
    setLoading(false);
  };

  const extractErrorMessage = (e: unknown): string => {
    if (e instanceof Error) {
      let msg = e.message || e.toString();
      if (e.cause) {
        const causeMsg =
          e.cause instanceof Error ? e.cause.message : String(e.cause);
        if (causeMsg) msg += ` | Cause: ${causeMsg}`;
      }
      return msg || "Unknown error occurred";
    }
    if (typeof e === "string") return e;
    if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      return (
        (obj.message as string) || (obj.error as string) || JSON.stringify(e)
      );
    }
    return String(e) || "Unknown error";
  };

  const handleWithRecovery = async (
    action: () => Promise<void>,
    actionName: string,
  ) => {
    setActionLoading(actionName);
    setError(null);
    try {
      await action();
    } catch (e) {
      const msg = extractErrorMessage(e);
      if (
        msg.includes("balance") ||
        msg.includes("FiberFailure") ||
        msg.includes("UTXO") ||
        msg.includes("wallet") ||
        msg.includes("coins")
      ) {
        setError(
          "Wallet failed to balance transaction. Please wait or refresh.",
        );
      } else {
        setError(msg);
      }
    }
    setActionLoading(null);
  };

  const handleConfirmPartyA = () =>
    handleWithRecovery(() => deployedContractAPI!.confirmByPartyA(), "partyA");

  const handleConfirmPartyB = () =>
    handleWithRecovery(() => deployedContractAPI!.confirmByPartyB(), "partyB");

  const handleFinalize = () =>
    handleWithRecovery(
      () => deployedContractAPI!.finalizeSettlement(),
      "finalize",
    );

  if (!isConnected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
        </div>
        <Card className="max-w-md w-full border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Connect Wallet
            </h2>
            <p className="text-muted-foreground text-sm">
              Connect your Midnight Lace wallet to access the secure settlement dashboard.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-blue-300/70 border border-blue-500/20 bg-blue-500/5 rounded-full px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Waiting for connection...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-20">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              Settlement Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Secure, Zero-Knowledge Proof based settlement
            </p>
          </div>
          
          {/* Quick Stats / Wallet Health */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-mono text-white/80">
              {dustBalance?.balance !== undefined 
                ? (Number(dustBalance.balance) / 1000000).toFixed(2) + " tDust"
                : "Loading..."}
            </span>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <span className={`w-2 h-2 rounded-full ${proofServerOnline ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-muted-foreground">Prover</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 border border-red-500/20 bg-red-500/10 rounded-xl p-4 flex items-start gap-4 backdrop-blur-md">
             <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
             <div className="flex-1">
               <h3 className="text-sm font-medium text-red-200">Action Required</h3>
               <p className="text-sm text-red-200/70 mt-1">{error}</p>
               {error.includes("wallet") && (
                 <Button 
                   size="sm" 
                   variant="outline" 
                   onClick={refresh}
                   disabled={walletRefreshing}
                   className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/20"
                 >
                   {walletRefreshing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                   Refresh Wallet
                 </Button>
               )}
             </div>
             <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400">
               <XCircle className="w-5 h-5" />
             </button>
          </div>
        )}

        {/* Progress Stepper */}
        <div className="mb-12">
           <div className="relative">
             {/* Line */}
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
                  style={{ width: isSettled ? "100%" : partyBConfirmed ? "66%" : partyAConfirmed ? "33%" : "0%" }}
                />
             </div>

             <div className="relative flex justify-between z-10 w-[90%] mx-auto">
               <StepperStep 
                 number="1" 
                 label="Party A" 
                 isActive={partyAConfirmed} 
                 isCompleted={partyAConfirmed}
               />
               <StepperStep 
                 number="2" 
                 label="Party B" 
                 isActive={partyAConfirmed && !partyBConfirmed} 
                 isCompleted={partyBConfirmed}
               />
               <StepperStep 
                 number="3" 
                 label="Finalize" 
                 isActive={partyBConfirmed && !isSettled} 
                 isCompleted={isSettled}
               />
             </div>
           </div>
        </div>

        {/* Main Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <ActionMethodCard 
             title="Party A Confirmation"
             description="Initiate the settlement agreement."
             icon={Shield}
             isActive={partyAConfirmed}
             isLoading={actionLoading === "partyA"}
             onClick={handleConfirmPartyA}
             disabled={!deployedContractAPI || actionLoading !== null || partyAConfirmed}
             color="blue"
           />
           <ActionMethodCard 
             title="Party B Confirmation"
             description="Verify and second the agreement."
             icon={Shield}
             isActive={partyBConfirmed}
             isLoading={actionLoading === "partyB"}
             onClick={handleConfirmPartyB}
             disabled={!deployedContractAPI || actionLoading !== null || partyBConfirmed}
             color="purple"
           />
           <ActionMethodCard 
             title="Final Settlement"
             description="Execute immutable proof on-chain."
             icon={Scale}
             isActive={isSettled}
             isLoading={actionLoading === "finalize"}
             onClick={handleFinalize}
             disabled={!deployedContractAPI || !partyAConfirmed || !partyBConfirmed || isSettled}
             color="green"
           />
        </div>

        {/* Contract & Deploy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Details */}
          <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                Contract Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <DetailItem label="Address" value={deployedContractAPI?.deployedContractAddress || "Connecting..."} mono />
                 <DetailItem label="Network" value={status?.networkId || "Unknown"} />
                 <DetailItem label="State" value={isSettled ? "Settled" : "Active"} highlight={isSettled} />
                 <DetailItem label="Privacy" value="ZK-Halo2" />
               </div>
               
               {joinStatus === "joining" && (
                 <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 p-2 rounded-lg">
                   <Loader2 className="w-3 h-3 animate-spin" /> Syncing with Midnight Indexer...
                 </div>
               )}
            </CardContent>
          </Card>

          {/* New Deployment */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white">Deploy New</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Need to start a fresh settlement process? Deploy a new contract instance.
              </p>
              <Button 
                onClick={deployNew} 
                disabled={loading} 
                variant="outline" 
                className="w-full border-white/20 hover:bg-white hover:text-black"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Deploy Contract
              </Button>
              {deployedAddress && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-300 mb-1">Successfully Deployed!</p>
                  <p className="text-[10px] font-mono text-green-100/70 break-all">{deployedAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

// Sub-components

function StepperStep({ number, label, isActive, isCompleted }: { number: string, label: string, isActive: boolean, isCompleted: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
        ${isCompleted ? "bg-white border-white text-black scale-110" : isActive ? "bg-black border-blue-500 text-blue-500" : "bg-black border-white/20 text-white/30"}`}>
        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span className="font-bold">{number}</span>}
      </div>
      <span className={`text-xs font-medium tracking-wide ${isCompleted || isActive ? "text-white" : "text-white/30"}`}>{label}</span>
    </div>
  )
}

function ActionMethodCard({ title, description, icon: Icon, isActive, isLoading, onClick, disabled, color }: any) {
  const getColors = () => {
    if (color === "blue") return "border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5";
    if (color === "purple") return "border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5";
    if (color === "green") return "border-green-500/30 hover:border-green-500/60 bg-green-500/5";
    return "border-white/10 hover:border-white/20";
  }

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 
        ${isActive ? "border-green-500/50 bg-green-500/10" : disabled ? "opacity-50 border-white/5 bg-white/[0.02]" : `${getColors()} backdrop-blur-sm`}
      `}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
        ${isActive ? "bg-green-500/20" : "bg-white/10 group-hover:bg-white/20"}
      `}>
         {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Icon className={`w-6 h-6 ${isActive ? "text-green-400" : "text-white"}`} />}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{isActive ? "Confirmed" : title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {isActive && (
        <div className="absolute top-4 right-4 text-green-400">
          <CheckCircle className="w-5 h-5" />
        </div>
      )}
    </button>
  )
}

function DetailItem({ label, value, mono, highlight }: any) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <p className={`text-sm ${mono ? "font-mono text-xs break-all" : "font-medium"} ${highlight ? "text-green-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  )
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
