// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AP.sol";
import "../AuthController/FactoryController.sol";

contract APfactory {
    mapping(address => AP) APs;
    FactoryController factoryController;

    constructor(FactoryController _fC) {
        factoryController = _fC;
    }

    event AdminCreada(AP a);

    modifier singleUse() {
        /** msg.sender no debe ser el dueño de ninguna otra entidad logica(expertos y empresas) */
        require(
            factoryController.isUnique(msg.sender),
            "Esta address ya es owner de otra entidad"
        );
        _;
    }

    modifier nuevaAP() {
        require(
            address(APs[msg.sender]) == address(0),
            "Ya existe una AP vinculada a esta address"
        );
        _;
    }

    function createAP(
        string memory _nombre,
        string memory _contacto,
        string memory _ubicacion
    ) external nuevaAP singleUse {
        require(msg.sender == tx.origin);
        AP adminPublica = new AP(_nombre, _contacto, _ubicacion, msg.sender);
        APs[msg.sender] = adminPublica;
        emit AdminCreada(adminPublica);
    }

    function getAP(address a) external view returns (AP) {
        return APs[a];
    }
}
