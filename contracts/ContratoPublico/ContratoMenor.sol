// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../PlataformaContratacion.sol";
import "./ContratoPublicoInterface.sol";

contract ContratoMenor is ContratoPublicoInterface {

    ContratoPublicoNFT public constant cpNFT =
        ContratoPublicoNFT(0x86337dDaF2661A069D0DcB5D160585acC2d15E9a);

    Empresa public empresa;
    bool public ADJUDICADO = false;

    constructor(
        string memory _objeto,
        uint256 _presupuesto,
        uint256 _valorEstimado,
        string memory _plazoEjecucion,
        string[] memory _CPV,
        string memory _subtipo,
        string memory _pliegosIPFS,
        Empresa _empresa,
        AP _owner
    ) {
        require(
            _valorEstimado < MIN_VALOR,
            "Para crear un contrato menor el valor estimado deber ser inferior a 40K euros"
        );
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
        empresa = _empresa;
    }

    function adjudicacionDirecta() external {
        require(!ADJUDICADO);
        require(msg.sender == adminPropietaria.owner());
        cpNFT.mint(address(empresa), pliegosIPFS);
        ADJUDICADO = true;
    }
}
