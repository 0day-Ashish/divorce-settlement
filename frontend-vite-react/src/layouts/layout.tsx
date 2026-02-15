import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { Scale } from "lucide-react";
import { MidnightWallet } from "@/modules/midnight/wallet-widget/ui/midnightWallet";
import { Button } from "@/components/ui/button";
import { Snowflake } from "lucide-react";
import { useState } from "react";
import { SnowOverlay } from "@/components/snow-overlay";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSnowing, setIsSnowing] = useState(false);

  const toggleSnow = () => {
    setIsSnowing(!isSnowing);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative">
      <SnowOverlay isEnabled={isSnowing} />
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl">
        <nav className="flex items-center justify-between px-6 py-3 rounded-2xl border border-border/40 bg-background/60 backdrop-blur-lg shadow-lg">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-sm tracking-tight hover:text-foreground/80 transition-colors"
            >
              <Scale className="w-4 h-4" />
              
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link
              to="/settlement"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              Settlement
            </Link>
            <Link
              to="/wallet-ui"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              Wallet
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSnow}
              className={`rounded-full transition-colors ${
                isSnowing
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <Snowflake className="h-5 w-5" />
            </Button>
            <MidnightWallet />
          </div>
        </nav>
      </header>
      <main className="flex-1 pt-24">{children}</main>
      <footer className="border-t border-border/40 py-4">
        <p className="text-center text-[10px] text-muted-foreground tracking-widest uppercase">
          Divorce Settlement Tracker &middot; Midnight Network
        </p>
      </footer>
    </div>
  );
};
