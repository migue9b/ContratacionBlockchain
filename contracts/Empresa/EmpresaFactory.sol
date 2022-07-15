// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Empresa.sol";
import "../AuthController/FactoryController.sol";

contract EmpresaFactory {
    mapping(address => Empresa) empresas;
    FactoryController factoryController;

    constructor(FactoryController _fC) {
        factoryController = _fC;
    }

    event EmpresaCreada(Empresa e);

    modifier singleUse() {
        /** msg.sender no debe ser el dueño de ninguna otra entidad logica(admins y expertos) */
        require(
            factoryController.isUnique(msg.sender),
            "Esta address ya es owner de otra entidad"
        );
        _;
    }

    modifier nuevaEmpresa() {
        require(
            address(empresas[msg.sender]) == address(0),
            "Ya existe una empresa vinculada a esta address"
        );
        _;
    }

    function createEmpresa(
        string memory _nombre,
        string memory _contacto,
        string memory _ubicacion
    ) external nuevaEmpresa singleUse {
        require(msg.sender == tx.origin);
        Empresa e = new Empresa(_nombre, _contacto, _ubicacion, msg.sender);
        empresas[msg.sender] = e;
        emit EmpresaCreada(e);
    }

    function getEmpresa(address _a) external view returns (Empresa) {
        return empresas[_a];
    }
}
