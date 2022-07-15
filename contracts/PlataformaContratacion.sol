// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AdminPublica/APfactory.sol";
import "./Empresa/EmpresaFactory.sol";
import "./Experto/ExpertoFactory.sol";
import "./Honesto.sol";
import "./ContratoPublicoNFT.sol";

contract PlataformaContratacion {
    APfactory public adminsFactory;
    EmpresaFactory public empresasFactory;
    ExpertoFactory public expertosFactory;
    FactoryController public factoryController;
    Honesto public hon;
    ContratoPublicoNFT public cpNFT;

    address owner;

    constructor() {
        factoryController = new FactoryController();
        adminsFactory = new APfactory(factoryController);
        empresasFactory = new EmpresaFactory(factoryController);
        expertosFactory = new ExpertoFactory(factoryController);
        factoryController.setAPFactory(adminsFactory);
        factoryController.setEmpresaFactory(empresasFactory);
        factoryController.setExpertoFactory(expertosFactory);
        hon = new Honesto();
        cpNFT = new ContratoPublicoNFT(adminsFactory);
        owner = msg.sender;
    }
}
