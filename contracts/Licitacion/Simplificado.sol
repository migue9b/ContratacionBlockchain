// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Licitacion.sol";

contract Simplificado is Licitacion {
    uint256 constant MAX_VALOR = 2000000 * 100;
    uint256 constant LAPSO_DIAS = 20;

    constructor(
        AP _ap,
        ContratoGenerico _cp,
        uint256 _fApertura,
        uint256 _fCierreOfertas
    ) {
        require(
            _cp.valorEstimado() <= MAX_VALOR,
            "Presupuesto superior a 2M euros"
        );
        require(
            _fCierreOfertas > _fApertura,
            "La fecha de cierre de ofertas debe ser posterior a la apertura"
        );
        require(
            _fApertura > block.timestamp,
            "La fecha de apertura debe ser posterior a la actual"
        );
        uint256 lapsoSegs = _fCierreOfertas - _fApertura;
        uint256 lapsoDias = (lapsoSegs / 3600) / 24;
        require(
            lapsoDias <= LAPSO_DIAS,
            "El plazo de ofertas es superior a 20 dias"
        );
        require(
            _ap.owner() == tx.origin,
            "La licitacion debe ser abierta por el responsable de la administracion publica"
        );
        require(
            _cp.adminPropietaria() == _ap,
            "La AP no es la propietaria del CP asociado"
        );

        adminPublica = _ap;
        contratoAsociado = _cp;
        fechaApertura = _fApertura;
        fechaCierreOfertas = _fCierreOfertas;
        fechaCierreRevelarOfertas = _fCierreOfertas + REVELAR_OFERTAS;
        fechaCierreEvaluacion = _fCierreOfertas;
    }
}
