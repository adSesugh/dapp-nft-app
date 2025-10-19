# NFT Collection DApp (Hardhat + Next.js)

A monorepo for deploying an ERC‑721 smart contract and minting NFTs from a Next.js dapp. Contracts are built with Hardhat 3 and Ignition; the frontend uploads files/metadata to IPFS via Pinata and calls `mintNFT`.

## Project Structure
- `contracts/MyNFT.sol`: ERC721URIStorage with owner‑only `mintNFT(address,string)`.
- `ignition/modules/MyNFTModule.ts`: Ignition module to deploy `MyNFT`.
- `nft-minter-dapp/`: Next.js app that uploads to IPFS and mints NFTs.
- `hardhat.config.ts`: Networks (`hardhatMainnet`, `hardhatOp`, `sepolia`).

## Prerequisites
- Node.js 18+ and npm.
- MetaMask connected to the same network as the contract.
- Pinata account + JWT for uploads.
- Env for testnet deployments:
  - `SEPOLIA_RPC_URL` (HTTP RPC)
  - `SEPOLIA_PRIVATE_KEY` (deployer account)

## Install & Compile
```bash
# root (Hardhat)
npm install
npm run compile

# frontend
cd nft-minter-dapp
npm install
```

## Deploy Contract
Local (simulated L1):
```bash
npx hardhat ignition deploy ignition/modules/MyNFTModule.ts --network hardhatMainnet
```
Sepolia testnet:
```bash
# ensure SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY are set
npx hardhat ignition deploy --network sepolia ignition/modules/MyNFTModule.ts
```
Note the deployed address and keep it for the frontend.

## Configure Frontend
Create `nft-minter-dapp/.env.local`:
```
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_gateway_domain   # optional
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContract
```
Run the app:
```bash
cd nft-minter-dapp
npm run dev
# http://localhost:3000
```
Connect MetaMask, fill name/description, select a file, and click “Mint NFT”. The app uploads your file and metadata to IPFS (Pinata) and calls `mintNFT(account, 'ipfs://<metadataCID>')`.

## Tests
```bash
npx hardhat test
```

## Notes
- Only the contract owner can mint. Ensure the deployer has mint permissions.
- Artifacts for the frontend ABI are generated under `artifacts/contracts/MyNFT.sol/` after compile.
- OP chain type example available in `scripts/send-op-tx.ts`.
