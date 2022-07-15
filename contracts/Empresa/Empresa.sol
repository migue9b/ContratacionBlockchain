// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../PlataformaContratacion.sol";
import "../Licitacion/LicitacionFactory.sol";

contract Empresa {
    string public nombre;
    string public contacto;
    string public ubicacion;
    address public owner;

    Licitacion[] public licitaciones;
    mapping(Licitacion => bool) public licitacionesMap;

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

    function addLicitacion(Licitacion _l) external {
        require(msg.sender == address(_l)); // la llamada a la funcion deber hacerse desde la licitacion que se pasa como parametro
        require(licitacionesMap[_l] == false); //evitar duplicados en el array de Licitaciones
        licitacionesMap[_l] = true;
        licitaciones.push(_l);
    }
}
