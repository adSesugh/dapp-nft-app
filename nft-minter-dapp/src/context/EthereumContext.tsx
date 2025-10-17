"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ethers } from "ethers";

interface EthereumContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
}

const EthereumContext = createContext<EthereumContextType>({
  account: null,
  provider: null,
  signer: null,
  connectWallet: async () => {},
});

export const EthereumProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected");

    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const accounts = (await prov.send("eth_requestAccounts", [])) as string[];
      if (accounts.length === 0) return;

      setAccount(accounts[0]);
      setProvider(prov);
      setSigner(await prov.getSigner());
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    }
  };

  // Auto-connect if previously authorized
  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      prov.send("eth_accounts", []).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setProvider(prov);
          prov.getSigner().then(setSigner);
        }
      });
    }
  }, []);

  return (
    <EthereumContext.Provider value={{ account, provider, signer, connectWallet }}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);
