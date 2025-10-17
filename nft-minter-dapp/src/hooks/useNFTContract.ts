import { useEthereum } from "@/context/EthereumContext";
import { ethers } from "ethers";
import abi from "../../../artifacts/contracts/MyNFT.sol/MyNFT.json";

export const useNFTContract = () => {
  const { signer } = useEthereum();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  if (!signer) return null;

  return new ethers.Contract(contractAddress, abi.abi, signer);
};
