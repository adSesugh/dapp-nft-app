# NFT Minter Dapp

A Next.js dapp that uploads media and NFT metadata to IPFS via Pinata, then mints an ERC‑721 token pointing to the IPFS metadata.

## Overview

- Frontend: Next.js (App Router) with `ethers` v6 for wallet and transactions.
- Backend: API routes using Pinata SDK with HTTP fallbacks for reliability.
- Smart contract: ERC‑721 `MyNFT` with `mintNFT(address to, string tokenURI)`.

## Architecture

- `src/components/NFTMinter.tsx`: UI to upload file, pin metadata, and mint.
- `src/context/EthereumContext.tsx`: Wallet connect via `ethers.BrowserProvider`.
- `src/hooks/useNFTContract.ts`: Loads ABI and contract at `NEXT_PUBLIC_CONTRACT_ADDRESS`.
- `src/app/api/upload/route.ts`: Pins files to Pinata, returns `{ IpfsHash, gatewayUrl }`.
- `src/app/api/pin-json/route.ts`: Pins JSON metadata to Pinata, returns `{ IpfsHash, gatewayUrl }`.
- `src/utils/config.ts`: Pinata SDK configuration.

## Prerequisites

- Node.js 18+ and npm.
- MetaMask installed and connected to the same network as the deployed contract.
- A deployed `MyNFT` contract with `mintNFT(address,string)`.
- Pinata account and JWT with Upload/Pin JSON permissions.

## Environment Variables

Create `.env.local` in the project root:

- `PINATA_JWT=your_pinata_jwt` (server secret)
- `NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_domain` (optional, e.g. `emerald-example.mypinata.cloud`)
- `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...` (deployed `MyNFT` address on your chosen network)

Restart `npm run dev` after changes.

## Smart Contract

- Function: `mintNFT(address to, string tokenURI)` mints to `to` with the IPFS metadata URI.
- ABI: Frontend imports from `artifacts/contracts/MyNFT.sol/MyNFT.json`.
- If you don’t have artifacts yet, compile and deploy with Hardhat:
  - `npm i --save-dev hardhat @nomicfoundation/hardhat-toolbox`
  - `npx hardhat init` and add `contracts/MyNFT.sol`
  - `npx hardhat compile`
  - `npx hardhat node` (in one terminal)
  - `npx hardhat run scripts/deploy.ts --network localhost`
  - Copy the deployed address to `NEXT_PUBLIC_CONTRACT_ADDRESS`.

## Frontend Usage

- Install dependencies: `npm i`
- Run dev server: `npm run dev`
- Open `http://localhost:3000`
- Connect wallet, enter NFT name/description, select an image/video, click “Mint NFT”.

### What Happens

- Uploads the selected file to Pinata (`/api/upload`) and returns `IpfsHash`.
- Builds metadata `{ name, description, image: 'ipfs://<fileCID>' }` and pins via `/api/pin-json`.
- Calls `contract.mintNFT(account, 'ipfs://<metadataCID>')`.
- Gas is estimated and supplied as `gasLimit` to prevent RPC errors.

## Pinata Integration

- SDK first: `pinata.upload.public.file()` / `pinata.upload.public.json()`.
- Fallback: HTTP endpoints if SDK fetch fails, returning Pinata’s error body for diagnostics.
- Outputs: `{ IpfsHash, gatewayUrl }`; `gatewayUrl` is derived using your gateway domain when available.

## Troubleshooting

- `401 Unauthorized` on Pinata:
  - Check `PINATA_JWT` is set and valid; JWT must allow Upload/Pin JSON.
- `500 Internal Server Error` on upload/pin:
  - Server returns `{ error, details }` with Pinata response; inspect `details`.
  - Ensure `.env.local` contains `PINATA_JWT` and restart dev server.
- `Buffer is not defined` errors:
  - API routes run on Node (`export const runtime = 'nodejs'`); ensure you didn’t move them to edge.
- `-32603 Internal JSON-RPC error` during mint:
  - Confirm `NEXT_PUBLIC_CONTRACT_ADDRESS` matches the network in MetaMask.
  - Ensure your account has mint permissions if the contract restricts minting.
  - Gas is estimated automatically, but you can add headroom: `(estimatedGas * 11n) / 10n`.
  - If mint requires payment, include `value` in overrides.

## Verification

- After mint, check the transaction in your wallet or block explorer.
- Resolve `ipfs://` CIDs using your gateway: `https://<NEXT_PUBLIC_GATEWAY_URL>/ipfs/<cid>`.
- Inspect contract storage and emitted events (e.g., `Transfer`) to confirm mint.

## Deploying

- Frontend deploys cleanly to Vercel; set env vars in the dashboard (`PINATA_JWT`, `NEXT_PUBLIC_GATEWAY_URL`, `NEXT_PUBLIC_CONTRACT_ADDRESS`).
- Use a hosted RPC (e.g., Infura/Alchemy) and deploy your contract to testnet/mainnet as needed.
