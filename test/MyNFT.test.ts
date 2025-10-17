import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("MyNFT", async function () {
  const { viem } = await network.connect();
  let deployer: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  it("Should deploy MyNFT and assign deployer as owner", async function () {
    const myNFT = await viem.deployContract("MyNFT");

    const owner = myNFT.address;
    assert.equal(owner, deployer, "Owner should be deployer");

    const nextId = await myNFT.read.nextTokenId();
    assert.equal(nextId, 0n, "Initial tokenId should be 0");
  });

  it("Should mint an NFT and increment _nextTokenId", async function () {
    const myNFT = await viem.deployContract("MyNFT");

    // Mint NFT to deployer
    await myNFT.write.mintNFT([myNFT.address, "ipfs://token-uri-1"]);

    const nextId = await myNFT.read.nextTokenId();
    assert.equal(nextId, 1n, "Token ID should increment after mint");

    // Optionally, mint a second NFT
    await myNFT.write.mintNFT([myNFT.address, "ipfs://token-uri-2"]);
    const nextId2 = await myNFT.read.nextTokenId();
    assert.equal(nextId2, 2n, "Token ID should increment again");
  });
});
