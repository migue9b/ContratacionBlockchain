// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../AdminPublica/AP.sol";
import "../ContratoPublico/ContratoGenerico.sol";
import "../Empresa/Empresa.sol";
import "../ContratoPublicoNFT.sol";

/** Basado en la implementacion de Blind Auction y State Machine con Solidity */
abstract contract Licitacion {
    ContratoPublicoNFT public constant cpNFT =
        ContratoPublicoNFT(0x86337dDaF2661A069D0DcB5D160585acC2d15E9a);
    uint256 public constant REVELAR_OFERTAS = 3 days;

    AP public adminPublica;
    ContratoGenerico public contratoAsociado;
    EstadosLicitacion public estadoActual = EstadosLicitacion.Preparacion;
    uint256 public fechaApertura; //EPOCHS
    uint256 public fechaCierreOfertas; //EPOCHS
    uint256 public fechaCierreRevelarOfertas; //EPOCHS
    uint256 public fechaCierreEvaluacion; // EPOCHS
    uint256 public fechaCreacion = block.timestamp;

    struct Oferta {
        address empresa;
        string descripcion;
        uint256 cantidad;
        string ipfsCID;
    }

    struct OfertaValEconomica {
        Oferta oferta;
        int256 valoracionEconomica;
    }

    mapping(Empresa => bytes32) public pujasOcultas;

    mapping(Empresa => OfertaValEconomica) public pujasAbiertas;
    OfertaValEconomica[] public pujasAbiertasArray;

    struct OfertaValFinal {
        Oferta oferta;
        int256 valoracionFinal;
    }

    OfertaValFinal public mejorOferta;

    event Puja(bytes32 oferta, Empresa empresa);
    event Adjudicacion(Empresa empresa);

    /**
    1. Preparación licitación: el expediente ha sido creado pero aún no se ha
        publicado el anuncio de licitación.
    2. Publicada/Recepción de ofertas: se ha publicado la licitación (y en su caso los
        pliegos) y aún no ha vencido la fecha de recepción de ofertas.
    3. Evaluación: ha vencido la fecha de recepción de ofertas y aún no hay
        adjudicación.
    4. Adjudicación: se ha publicado una resolución (provisional o definitiva)
     */

    enum EstadosLicitacion {
        Preparacion,
        RecepcionOfertas,
        RevelarOfertas,
        Evaluacion,
        Adjudicando,
        Adjudicado
    }

    function nextEstado() internal {
        estadoActual = EstadosLicitacion(uint256(estadoActual) + 1);
    }

    modifier enEstado(EstadosLicitacion _estado) {
        if (estadoActual != _estado) revert("OperacionInvalidaEnEstadoActual");
        _;
    }

    modifier transicionesTiempo() {
        if (
            estadoActual == EstadosLicitacion.Preparacion &&
            block.timestamp >= fechaApertura
        ) nextEstado();

        if (
            estadoActual == EstadosLicitacion.RecepcionOfertas &&
            block.timestamp >= fechaCierreOfertas
        ) nextEstado();

        if (
            estadoActual == EstadosLicitacion.RevelarOfertas &&
            block.timestamp >= fechaCierreRevelarOfertas
        ) nextEstado();

        if (
            estadoActual == EstadosLicitacion.Evaluacion &&
            block.timestamp >= fechaCierreEvaluacion
        ) nextEstado();

        _;
    }

    function pujar(bytes32 _oferta, Empresa _empresa)
        public
        virtual
        transicionesTiempo
        enEstado(EstadosLicitacion.RecepcionOfertas)
    {
        require(_empresa.owner() == msg.sender);
        require(pujasOcultas[_empresa] == bytes32(0));
        pujasOcultas[_empresa] = _oferta;
        _empresa.addLicitacion(this);
        emit Puja(_oferta, _empresa);
    }

    function revelarOferta(Oferta memory _oferta, Empresa _empresa)
        external
        transicionesTiempo
        enEstado(EstadosLicitacion.RevelarOfertas)
    {
        require(pujasAbiertas[_empresa].oferta.empresa == address(0)); //no debe haber sido revelada anteriormente
        require(_empresa.owner() == msg.sender);
        require(pujasOcultas[_empresa] != bytes32(0)); //debe existir oferta para la empresa en cuestion
        require(_oferta.empresa == address(_empresa));

        require(
            pujasOcultas[_empresa] ==
                keccak256(
                    abi.encodePacked(
                        _oferta.empresa,
                        _oferta.descripcion,
                        _oferta.cantidad,
                        _oferta.ipfsCID
                    )
                ),
            "Oferta diferente a la puja original"
        );
        int256 valoracionEconomica = int256(contratoAsociado.presupuesto()) -
            int256(_oferta.cantidad);
        pujasOcultas[_empresa] = bytes32(0); //evita que la misma empresa vuelva a añadir su oferta
        OfertaValEconomica memory o = OfertaValEconomica(
            _oferta,
            valoracionEconomica
        );
        pujasAbiertas[_empresa] = o;
        pujasAbiertasArray.push(o);

        //actualizacion de la mejor oferta si se supera.
        //en caso de igualdad se prioriza por tiempos de llegada.
        if (valoracionEconomica > mejorOferta.valoracionFinal) {
            mejorOferta.oferta = _oferta;
            mejorOferta.valoracionFinal = valoracionEconomica;
        }
    }

    function adjudicar()
        public
        virtual
        transicionesTiempo
        enEstado(EstadosLicitacion.Adjudicando)
    {
        require(msg.sender == adminPublica.owner());
        address mejorEmpresa = mejorOferta.oferta.empresa;
        cpNFT.mint(mejorEmpresa, contratoAsociado.pliegosIPFS());
        nextEstado();
        emit Adjudicacion(Empresa(mejorEmpresa));
    }
}
