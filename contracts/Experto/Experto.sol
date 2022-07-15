// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../Licitacion/Licitacion.sol";

contract Experto {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }
}
