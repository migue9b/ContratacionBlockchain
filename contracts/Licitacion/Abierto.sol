// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Licitacion.sol";
import "../Experto/Experto.sol";
import "../Experto/ExpertoFactory.sol";
import "../Honesto.sol";

contract Abierto is Licitacion {
    uint256 public garantiaProvisional;
    uint256 private constant NUM_EXPERTOS = 5;
    Honesto public constant hon =
        Honesto(0x603E1BD79259EbcbAaeD0c83eeC09cA0B89a5bcC);

    ExpertoFactory expertosFactory =
        ExpertoFactory(0x10C6E9530F1C1AF873a391030a1D9E8ed0630D26);

    Experto[] public expertos;

    event Evaluacion(ValCualitativa[] valoraciones, Experto experto);

    struct OfertaValCualitativa {
        uint256 valoracionCualitativa; //suma de las valoraciones de 'expertoValoracion'
        mapping(Experto => uint256) expertoValoracion;
    }

    mapping(Empresa => OfertaValCualitativa) public pujasCalificadas;

    constructor(
        AP _ap,
        ContratoGenerico _cp,
        uint256 _fApertura,
        uint256 _fCierreOfertas,
        uint256 _fCierreEvaluacion
    ) {
        require(
            _fCierreEvaluacion > _fCierreOfertas + REVELAR_OFERTAS + 7 days, //el periodo de eval. debe ser, por lo menos, una semana.
            "La fecha de cierre de evaluacion debe ser superior a fCierreOfertas + REVELAR_OFERTAS + 7 dias"
        );
        require(
            _fCierreOfertas > _fApertura,
            "La fecha de cierre de ofertas debe ser posterior a la apertura"
        );
        require(
            _fApertura > block.timestamp,
            "La fecha de apertura debe ser posterior a la actual"
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
        fechaCierreEvaluacion = _fCierreEvaluacion;
        garantiaProvisional = (3 * _cp.presupuesto()) / 100; //3% del presupuesto base
        expertos = expertosFactory.getNrandom(NUM_EXPERTOS);
    }

    struct ValCualitativa {
        Empresa empresa;
        uint256 valoracion;
    }

    function evaluar(ValCualitativa[] memory _valoraciones, Experto _experto)
        external
        transicionesTiempo
        enEstado(EstadosLicitacion.Evaluacion)
    {
        require(_experto.owner() == msg.sender);
        require(esExpertoValido(_experto));
        require(_valoraciones.length == pujasAbiertasArray.length);

        for (uint256 i = 0; i < _valoraciones.length; i++) {
            Empresa empresaValorada = _valoraciones[i].empresa;
            uint256 valoracion = _valoraciones[i].valoracion;
            //empresaValorada debe ser una empresa existente
            require(
                pujasAbiertas[empresaValorada].oferta.empresa != address(0)
            );
            //rango de valoracion: [1-101]
            require(valoracion >= 1 && valoracion <= 101);
            //no debe existir una valoracion del mismo experto
            require(
                pujasCalificadas[empresaValorada].expertoValoracion[_experto] ==
                    0
            );
            //actualizacion de la valoracion del experto y el acumulado de valoraciones
            pujasCalificadas[empresaValorada].expertoValoracion[_experto] =
                valoracion *
                100;
            pujasCalificadas[empresaValorada].valoracionCualitativa +=
                valoracion *
                100;

            //suma del acumulado de las valCualitativas y la valEconomica de la empresa en cuestion
            int256 aux = int256(
                pujasCalificadas[empresaValorada].valoracionCualitativa
            ) + pujasAbiertas[empresaValorada].valoracionEconomica;
            if (aux > mejorOferta.valoracionFinal) {
                mejorOferta.oferta = pujasAbiertas[empresaValorada].oferta;
                mejorOferta.valoracionFinal = aux;
            }
        }
        emit Evaluacion(_valoraciones, _experto);
    }

    function pujar(bytes32 _oferta, Empresa _empresa)
        public
        override
        transicionesTiempo
        enEstado(EstadosLicitacion.RecepcionOfertas)
    {
        require(_empresa.owner() == msg.sender);

        /**El procedimiento para 'abonar' la fianza(garantia provisional) es el siguiente:
        
        1º: La empresa que quiere realizar una puja llama a la función 'Honesto.approve(destinatario, cantidad)'; siendo
        destinatario este contrato(es quién tendrá permiso para realizar una transaccion), y cantidad el 3% del presupuesto. De esta
        forma, se autoriza al SmartContract(el que representa la licitacion donde se desea pujar) a transferir la 'cantidad' de fondos 
        desde la address del dueño de la empresa al SC.
        
        2º: Esta funcion comprueba que existe el 'allowance' correcto. Es decir, que la cantidad que puede gastar address(this) 
        de msg.sender(el owner de la empresa) es la acordada en 'approve'.

        3º: Se realiza la transaccion de fondos: la cantidad(el 3% del presupuesto) es transferida del owner de la empresa
        a este SmartContract.

        */
        require(
            hon.allowance(msg.sender, address(this)) == garantiaProvisional
        );
        require(
            hon.transferFrom(msg.sender, address(this), garantiaProvisional)
        );

        super.pujar(_oferta, _empresa);
    }

    function adjudicar()
        public
        override
        transicionesTiempo
        enEstado(EstadosLicitacion.Adjudicando)
    {
        require(msg.sender == adminPublica.owner());

        for (uint256 i = 0; i < pujasAbiertasArray.length; i++) {
            if (
                pujasAbiertasArray[i].oferta.empresa ==
                mejorOferta.oferta.empresa
            ) continue;
            address empresaPagable = Empresa(
                pujasAbiertasArray[i].oferta.empresa
            ).owner();
            hon.transfer(empresaPagable, garantiaProvisional);
        }

        super.adjudicar();
    }

    function esExpertoValido(Experto _experto) private view returns (bool) {
        for (uint256 i = 0; i < NUM_EXPERTOS; i++) {
            if (address(expertos[i]) == address(_experto)) return true;
        }
        return false;
    }

    function getExpertos() external view returns (Experto[] memory) {
        return expertos;
    }

    function getCalificacionExperto(Empresa _em, Experto _ex)
        external
        view
        returns (uint256)
    {
        return pujasCalificadas[_em].expertoValoracion[_ex];
    }
}
