// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ContratoPublicoInterface.sol";
import "../Licitacion/LicitacionFactory.sol";
import "../Licitacion/Licitacion.sol";

contract ContratoGenerico is ContratoPublicoInterface {
    bool public armonizado;
    Licitacion public licitacion;

    event LicitacionCreada(Licitacion l);

    constructor(
        string memory _objeto,
        uint256 _presupuesto,
        uint256 _valorEstimado,
        string memory _plazoEjecucion,
        string[] memory _CPV,
        string memory _subtipo,
        string memory _pliegosIPFS,
        AP _owner
    ) {
        require(
            _valorEstimado <= MAX_VALOR,
            "El valor estimado no puede superar los 12M de euros"
        );
        require(
            _valorEstimado >= MIN_VALOR,
            "El contrato debe ser de tipo menor y seguir sus regulaciones"
        );
        if (_valorEstimado >= MIN_ARMONIZADO) {
            armonizado = true;
        }
        require(
            tx.origin == _owner.owner(),
            "El contrato debe ser creado por el owner de la AP"
        );

        objeto = _objeto;
        presupuesto = _presupuesto;
        valorEstimado = _valorEstimado;
        plazoEjecucion = _plazoEjecucion;
        CPV = _CPV;
        subtipo = _subtipo;
        adminPropietaria = _owner;
        pliegosIPFS = _pliegosIPFS;
    }

    function createLicitacion(string memory _tipo, bytes memory _datos)
        external
    {
        require(
            msg.sender == adminPropietaria.owner(),
            "La licitacion debe ser abierta por el owner de la AP"
        );
        require(
            address(licitacion) == address(0),
            "Ya existe una licitacion activa para este contrato"
        );

        LicitacionFactory lf = new LicitacionFactory();
        licitacion = lf.createLicitacion(_tipo, _datos);
        emit LicitacionCreada(licitacion);
    }
}
