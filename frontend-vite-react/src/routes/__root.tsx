import { createRootRoute, Outlet } from "@tanstack/react-router";
import * as pino from "pino";
import { ThemeProvider } from "@/components/theme-provider";
import { MidnightMeshProvider } from "@/modules/midnight/wallet-widget/contexts/wallet";
import { DivorceAppProvider } from "@/modules/midnight/divorce-sdk/contexts";
import { MainLayout } from "@/layouts/layout";

export const logger = pino.pino({
  level: "trace",
});

// Deployed contract address on Midnight Preprod testnet
const contractAddress =
  import.meta.env.VITE_CONTRACT_ADDRESS ??
  "822abc2d9740bb00f93861e7d9e804a48c2beb16c04d1c17f7f0ca0b8479695f";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MidnightMeshProvider logger={logger}>
        <DivorceAppProvider logger={logger} contractAddress={contractAddress}>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </DivorceAppProvider>
      </MidnightMeshProvider>
    </ThemeProvider>
  );
}
