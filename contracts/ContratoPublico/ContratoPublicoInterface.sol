// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../AdminPublica/AP.sol";

/** Se marca como "Interface" en el nombre a pesar de que no es una interfaz. De esta forma
se modela un contrato abstracto que provee las funcionalidades básicas a los contratos genericos y menores.
 */
abstract contract ContratoPublicoInterface {
    uint256 constant MAX_VALOR = 12000000 * 100; // valor maximo antes de ser aprobado por el C.Ministros
    uint256 constant MIN_VALOR = 40000 * 100; // valor minimo que marca la frontera con el contrato menor
    uint256 constant MIN_ARMONIZADO = 5382000 * 100; // valor a partir del cual el contrato debe seguir una regulacion armonizada

    string public objeto;
    uint256 public presupuesto; // valor en centimos
    uint256 public valorEstimado; // valor en centimos
    string public plazoEjecucion;
    string[] public CPV;
    string public subtipo;
    string public pliegosIPFS;
    AP public adminPropietaria;


    function getCPVs() public view returns (string[] memory) {
        return CPV;
    }
}
