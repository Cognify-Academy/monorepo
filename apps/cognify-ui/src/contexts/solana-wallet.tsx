"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import React, { type FC, type ReactNode, useMemo } from "react";

// Import wallet adapter CSS (must be done at component level for Next.js)
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({
  children,
}) => {
  // Use devnet for local testing, switch to mainnet-beta for production
  const network =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
      ? "mainnet-beta"
      : "devnet";

  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
    [network],
  );

  // Initialize wallets
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
