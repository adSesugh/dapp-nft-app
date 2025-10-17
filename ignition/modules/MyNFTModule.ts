import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyNFTModule", (m) => {
  // Deploy the contract
  const myNFT = m.contract("MyNFT");
  
  return { myNFT };
});
