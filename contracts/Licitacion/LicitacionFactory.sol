// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Abierto.sol";
import "./Simplificado.sol";

contract LicitacionFactory {
    constructor() {}

    modifier onlyOwner() {
        /**
        Comprueba que quién inició la petición sea el dueño de la AP que posee el contrato.
        Es decir:
        EOA(cartera privada de un particular==tx.origin) --dueño--> AP --posee--> ContratoGenerico --abre--> Licitacion
         */
        require(
            tx.origin ==
                ContratoGenerico(msg.sender).adminPropietaria().owner(),
            "La licitacion debe ser abierta por el owner de la AP"
        );
        _;
    }

    function createLicitacion(string memory _tipo, bytes memory _datos)
        external
        onlyOwner
        returns (Licitacion)
    {
        Licitacion l;
        ContratoGenerico cp = ContratoGenerico(msg.sender);
        AP a = ContratoGenerico(msg.sender).adminPropietaria();

        if (equals(_tipo, "abierto")) {
            (uint256 fA, uint256 fCO, uint256 fE) = abi.decode(
                _datos,
                (uint256, uint256, uint256)
            );
            l = new Abierto(a, cp, fA, fCO, fE);
        } else if (equals(_tipo, "simplificado")) {
            (uint256 fA, uint256 fCO) = abi.decode(_datos, (uint256, uint256));
            l = new Simplificado(a, cp, fA, fCO);
        } else revert("Tipo de licitacion incorrecto");
        return l;
    }

    function equals(string memory _a, string memory _b)
        private
        pure
        returns (bool)
    {
        return keccak256(bytes(_a)) == keccak256(bytes(_b));
    }
}
