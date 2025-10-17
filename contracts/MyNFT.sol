// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
  uint256 private _nextTokenId;
  address private _owner;

  constructor() ERC721("MyNFT", "MNFT") {}

  modifier onlyOwner() {
    require(msg.sender == _owner, "Not the owner");
    _;
  }

  function nextTokenId() public view returns (uint256) {
    return _nextTokenId;
  }

  function mintNFT(address recipient, string memory tokenURI) public onlyOwner {
    uint256 tokenId = _nextTokenId++;
    _mint(recipient, tokenId);
    _setTokenURI(tokenId, tokenURI);
  }
}
