// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ContratoMenor.sol";
import "./ContratoGenerico.sol";

contract ContratoFactory {
    constructor() {}

    modifier onlyOwner() {
        //Comprueba que quién inició la petición sea el dueño de la AP
        require(
            tx.origin == AP(msg.sender).owner(),
            "El contrato debe ser creado por el owner de la AP"
        );
        _;
    }

    function createContrato(string memory _tipo, bytes memory _datos)
        external
        onlyOwner
        returns (ContratoPublicoInterface)
    {
        ContratoPublicoInterface c;
        if (equals(_tipo, "menor")) {
            (
                string memory o,
                uint256 p,
                uint256 vE,
                string memory pE,
                string[] memory CPV,
                string memory s,
                string memory pI,
                address e
            ) = abi.decode(
                    _datos,
                    (string, uint256, uint256, string, string[], string, string, address)
                );
            c = new ContratoMenor(o, p, vE, pE, CPV, s, pI, Empresa(e), AP(msg.sender));
        } else if (equals(_tipo, "generico")) {
            (
                string memory o,
                uint256 p,
                uint256 vE,
                string memory pE,
                string[] memory CPV,
                string memory s,
                string memory pI
            ) = abi.decode(
                    _datos,
                    (string, uint256, uint256, string, string[], string, string)
                );
            c = new ContratoGenerico(o, p, vE, pE, CPV, s, pI, AP(msg.sender));
        } else revert("Tipo de contrato incorrecto");
        return c;
    }

    function equals(string memory _a, string memory _b)
        private
        pure
        returns (bool)
    {
        return keccak256(bytes(_a)) == keccak256(bytes(_b));
    }
}
