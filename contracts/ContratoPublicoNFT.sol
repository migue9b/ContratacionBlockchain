// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./AdminPublica/APfactory.sol";
import "./Licitacion/Licitacion.sol";

contract ContratoPublicoNFT is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    APfactory public apFactory;

    constructor(APfactory _apF) ERC721("ContratoPublicoNFT", "CP") {
        apFactory = _apF;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function mint(address to, string memory uri) public {
        require(tx.origin == Licitacion(msg.sender).adminPublica().owner()); // msg.sender debe ser AP existente
        require(address(apFactory.getAP(tx.origin)) != address(0)); // la AP debe existir en su factoria
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
