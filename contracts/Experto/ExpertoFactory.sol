// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Experto.sol";
import "../AuthController/FactoryController.sol";

contract ExpertoFactory {
    mapping(address => Experto) expertos;
    Experto[] expertosArray;
    FactoryController factoryController;

    constructor(FactoryController _fC) {
        factoryController = _fC;
    }

    event ExpertoCreado(Experto ex);

    modifier singleUse() {
        /** msg.sender no debe ser el dueño de ninguna otra entidad logica(admins y empresas) */
        require(
            factoryController.isUnique(msg.sender),
            "Esta address ya es owner de otra entidad"
        );
        _;
    }

    modifier nuevoExperto() {
        require(
            address(expertos[msg.sender]) == address(0),
            "Ya existe un experto vinculado a esta address"
        );
        _;
    }

    function createExperto() external nuevoExperto singleUse {
        require(msg.sender == tx.origin);
        Experto e = new Experto(msg.sender);
        expertos[msg.sender] = e;
        expertosArray.push(e);
        emit ExpertoCreado(e);
    }

    function getExperto(address _a) external view returns (Experto) {
        return expertos[_a];
    }

    function getAllExpertos() external view returns (Experto[] memory) {
        return expertosArray;
    }

    function getNrandom(uint256 num_expertos)
        external
        view
        returns (Experto[] memory)
    {
        require(
            expertosArray.length >= num_expertos * 2,
            "Debe haber por lo menos el doble de expertos disponibles"
        );
        uint256 l = expertosArray.length;
        Experto[] memory expertosRandom = new Experto[](num_expertos);
        uint256 cont = 0;
        bool[] memory auxTracker = new bool[](l);
        while (cont < num_expertos) {
            uint256 random = uint8(
                uint256(
                    keccak256(
                        abi.encode(
                            block.timestamp,
                            block.difficulty,
                            cont,
                            l,
                            gasleft()
                        )
                    )
                ) % l
            );
            if (auxTracker[random] == true) continue;
            expertosRandom[cont] = expertosArray[random];
            auxTracker[random] = true;
            cont++;
        }
        return expertosRandom;
    }
}
