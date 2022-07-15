// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../AdminPublica/APfactory.sol";
import "../Empresa/EmpresaFactory.sol";
import "../Experto/ExpertoFactory.sol";

/**
El objetivo de este Smart Contract es proveer un controlador de cuentas, evitando la asociacion de más de una
entidad a una EOA.
De esta forma, se controla el acceso desde direcciones que NO sean Smart Contracts.
 */

contract FactoryController {
    APfactory public apFactory;
    EmpresaFactory public empresaFactory;
    ExpertoFactory public expertoFactory;

    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function setAPFactory(APfactory _apF) external onlyOwner {
        apFactory = _apF;
    }

    function setEmpresaFactory(EmpresaFactory _emF) external onlyOwner {
        empresaFactory = _emF;
    }

    function setExpertoFactory(ExpertoFactory _exF) external onlyOwner {
        expertoFactory = _exF;
    }

    function isUnique(address _a) external view returns (bool) {
        if (address(apFactory.getAP(_a)) != address(0)) return false;
        if (address(empresaFactory.getEmpresa(_a)) != address(0)) return false;
        if (address(expertoFactory.getExperto(_a)) != address(0)) return false;
        return true;
    }
}
