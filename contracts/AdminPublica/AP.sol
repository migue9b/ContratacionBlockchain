// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../ContratoPublico/ContratoPublicoInterface.sol";
import "../ContratoPublico/ContratoFactory.sol";

contract AP {
    string public nombre;
    string public contacto;
    string public ubicacion;
    address public owner;

    ContratoPublicoInterface[] public contratos;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    event ContratoCreado(ContratoPublicoInterface c);

    constructor(
        string memory _nombre,
        string memory _contacto,
        string memory _ubicacion,
        address _owner
    ) {
        nombre = _nombre;
        contacto = _contacto;
        ubicacion = _ubicacion;
        owner = _owner;
    }

    function createContrato(string memory _tipo, bytes memory _datos)
        external
        onlyOwner
    {
        ContratoFactory cf = new ContratoFactory();
        ContratoPublicoInterface c = cf.createContrato(_tipo, _datos);
        contratos.push(c);
        emit ContratoCreado(c);
    }

    function getContratos()
        external
        view
        returns (ContratoPublicoInterface[] memory)
    {
        return contratos;
    }
}
