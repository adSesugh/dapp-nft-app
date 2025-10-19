'use client'

import { ChangeEvent, useState } from "react";
import { useEthereum } from "@/context/EthereumContext";
import { useNFTContract } from "@/hooks/useNFTContract";

export default function NFTMinter() {
  const { account, connectWallet } = useEthereum();
  const contract = useNFTContract();
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  const mintNFT = async () => {
    if (!contract || !account) return alert("Connect wallet first");
    try {
      const tokenURI = await uploadToIPFS();
      setStatus("Minting NFT on blockchain...");

      // Estimate gas to avoid low default limits causing tx failure
      const estimatedGas = await contract.mintNFT.estimateGas(account, tokenURI);
      const tx = await contract.mintNFT(account, tokenURI, { gasLimit: estimatedGas });
      await tx.wait();

      setStatus(`NFT Minted Successfully! Tx: ${tx.hash}`);
    } catch (err: unknown) {
      console.error(err);
      setStatus(" Error: " + (err as Error).message || "Unknown error");
    }
  };

  const uploadToIPFS = async (): Promise<string> => {
    if (!file) throw new Error("No file selected");
    setStatus("Uploading image to IPFS...");
    setPreview("")

    // Upload file
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upload failed (${res.status}): ${errText || res.statusText}`);
    }
    const data = await res.json();
    if (!data.IpfsHash) throw new Error("Upload failed");

    const imageURI = `ipfs://${data.IpfsHash}`;

    // Upload metadata
    const metadata = {
      name,
      description: desc,
      image: imageURI,
    };

    setStatus("Uploading metadata to IPFS...");
    const metaRes = await fetch("/api/pin-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });
    if (!metaRes.ok) {
      const errText = await metaRes.text();
      throw new Error(`Metadata upload failed (${metaRes.status}): ${errText || metaRes.statusText}`);
    }
    const metaData = await metaRes.json();
    if (!metaData.IpfsHash) throw new Error("Metadata upload failed");

    return `ipfs://${metaData.IpfsHash}`;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-100 p-6 overflow-y-scroll">
      <h1 className="text-3xl font-bold">🎨 NFT Minter</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect MetaMask
        </button>
      ) : (
        <p>Connected as: {account}</p>
      )}

      <input
        type="text"
        placeholder="NFT Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-80"
      />

      <textarea
        placeholder="NFT Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="border p-2 rounded w-80"
      />

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="border p-2 rounded w-80"
      />

      {preview && <img src={preview} alt="Preview" className="w-60 rounded-lg" />}

      <button
        onClick={mintNFT}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Mint NFT
      </button>

      <p className="text-sm text-gray-700">{status}</p>
    </div>
  )
}