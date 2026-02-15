import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Server, Wifi, WifiOff, Wallet, RefreshCw, Copy, Check, Shield } from "lucide-react";
import { MidnightWallet } from "@/modules/midnight/wallet-widget/ui/midnightWallet";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";

export function WalletUI() {
  const {
    disconnect,
    setOpen,
    refresh,
    status,
    proofServerOnline,
    initialAPI,
    unshieldedAddress,
    shieldedAddresses,
    serviceUriConfig,
    dustAddress,
    dustBalance,
    unshieldedBalances,
  } = useWallet();

  const isConnected = status?.status === "connected";

  return (
    <div className="min-h-screen relative pb-10">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              Wallet Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Manage your diverse assets and connection status
            </p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={refresh} className="border-white/10 hover:bg-white/5">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
             </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Wallet Card */}
          <Card className="md:col-span-8 bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5 text-blue-400" />
                Wallet Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your connected wallet addresses and balances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex-shrink-0">
                   <div className="p-2 bg-black/50 rounded-xl border border-white/10">
                     <MidnightWallet />
                   </div>
                   <div className="mt-4 flex flex-col gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="w-full justify-start text-xs h-8 text-muted-foreground hover:text-white hover:bg-white/5">
                        <Wallet className="mr-2 h-3 w-3" /> Open Wallet UI
                      </Button>
                      <Button variant="ghost" size="sm" onClick={disconnect} className="w-full justify-start text-xs h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Link2 className="mr-2 h-3 w-3" /> Disconnect
                      </Button>
                   </div>
                </div>

                <div className="flex-1 w-full grid gap-4 grid-cols-1 md:grid-cols-2">
                   <AddressField label="Unshielded Address" value={unshieldedAddress?.unshieldedAddress} />
                   <AddressField label="Shielded Address" value={shieldedAddresses?.shieldedAddress} />
                   <AddressField label="Coin Public Key" value={shieldedAddresses?.shieldedCoinPublicKey} />
                   <AddressField label="Dust Address" value={dustAddress?.dustAddress} />
                </div>
              </div>

              {/* Balances Section */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Balances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <BalanceCard 
                    label="Dust Balance" 
                    value={dustBalance?.balance ? (Number(dustBalance.balance) / 1000000000000000).toLocaleString() : "—"} 
                  />
                  <BalanceCard 
                    label="Dust Cap" 
                    value={dustBalance?.cap ? (Number(dustBalance.cap) / 1000000000000000).toLocaleString() : "—"} 
                  />
                   {unshieldedBalances && Object.entries(unshieldedBalances).map(([token, balance]) => (
                      <BalanceCard 
                        key={token} 
                        label={token} 
                        value={(Number(balance) / 1000000).toLocaleString()} 
                      />
                   ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar / Connection Details */}
          <div className="md:col-span-4 space-y-6">
             <Card className="bg-black/40 border-white/10 backdrop-blur-md h-full">
                {isConnected && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                    <Server className="h-3 w-3" />
                    Network: {(status as any)?.networkId}
                  </div>
                )}
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-white">
                   <Server className="h-5 w-5 text-purple-400" />
                   Network Status
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 
                 {/* Status Indicator */}
                 <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Connection</span>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                       <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                       {isConnected ? "ONLINE" : "OFFLINE"}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <StatusRow 
                      label="Proof Server" 
                      status={proofServerOnline} 
                      icon={proofServerOnline ? Wifi : WifiOff}
                    />
                    <StatusRow 
                      label="Network ID" 
                      value={status?.networkId || "Unknown"}
                      icon={Server}
                    />
                 </div>

                 <div className="pt-6 border-t border-white/10 space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Endpoints</h4>
                    <EndpointRow label="Substrate Node" value={serviceUriConfig?.substrateNodeUri} />
                    <EndpointRow label="Indexer (REST)" value={serviceUriConfig?.indexerUri} />
                    <EndpointRow label="Indexer (WS)" value={serviceUriConfig?.indexerWsUri} />
                    <EndpointRow label="Proof Server" value={serviceUriConfig?.proverServerUri} />
                 </div>

               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function AddressField({ label, value }: { label: string, value?: string }) {
   const [copied, setCopied] = useState(false);

   const handleCopy = () => {
      if (value) {
         navigator.clipboard.writeText(value);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      }
   }

   return (
      <div className="space-y-1.5 group">
         <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <button 
               onClick={handleCopy}
               className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
               disabled={!value}
            >
               {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
               {copied ? "Copied" : "Copy"}
            </button>
         </div>
         <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-white/80 break-all min-h-[40px] flex items-center">
            {value || <span className="text-white/20 italic">Not connected</span>}
         </div>
      </div>
   )
}

function BalanceCard({ label, value }: { label: string, value: string }) {
   return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
         <div className="text-xs text-muted-foreground mb-1">{label}</div>
         <div className="text-xl font-bold text-white tracking-tight">{value}</div>
      </div>
   )
}

function StatusRow({ label, status, value, icon: Icon }: any) {
   const isOnline = status === true;
   
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-sm text-gray-300">
            {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
            {label}
         </div>
         <span className={`text-sm font-medium ${value ? "text-white" : isOnline ? "text-green-400" : "text-red-400"}`}>
            {value || (isOnline ? "Active" : "Inactive")}
         </span>
      </div>
   )
}

function EndpointRow({ label, value }: { label: string, value?: string }) {
   return (
      <div className="group">
         <div className="text-xs text-muted-foreground mb-1">{label}</div>
         <div className="text-xs font-mono text-white/60 truncate group-hover:text-white transition-colors" title={value}>
            {value || "Not configured"}
         </div>
      </div>
   )
}
