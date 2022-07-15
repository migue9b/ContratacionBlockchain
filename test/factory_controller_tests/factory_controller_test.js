const { expect } = require("chai");
const { ethers } = require("hardhat");
const deployHelper = require("../deploy-helpers");


describe("Factory Controller", async function() {

  it("El owner deberia ser la Plataforma de Contratacion", async function() {
    const platCont = await deployHelper.deployPlatContratacion();
    const factoryControllerAddress = await platCont.factoryController();
    const factoryControllerContract = await ethers.getContractAt(
      "FactoryController",
      factoryControllerAddress
    );
    expect(await platCont.factoryController()).to.be.equal(
      factoryControllerContract.address
    );
  });

  it("Deberia revertir la modificacion de una var. de estado si el sender no es el owner", async function() {
    const platCont = await deployHelper.deployPlatContratacion();
    const factoryControllerAddress = await platCont.factoryController();
    const factoryControllerContract = await ethers.getContractAt(
      "FactoryController",
      factoryControllerAddress
    );
    await expect(
      factoryControllerContract.setAPFactory(
        "0x0000000000000000000000000000000000000000"
      )
    ).to.be.reverted;
  });
});