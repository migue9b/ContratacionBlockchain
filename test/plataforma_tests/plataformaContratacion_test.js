const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Plataforma de Contratacion", async function() {
  before(async () => {
    const [h1, h2] = await ethers.getSigners();
    global.h1 = h1;
    global.pr1 = await ethers.getDefaultProvider();
    global.PlataformaContratacion = await ethers.getContractFactory("PlataformaContratacion");
    global.platCont = await PlataformaContratacion.deploy();
    await platCont.deployed();
  });

  it("Deberia crear una referencia a la APfactory", async function() {
    const aPsFactoryAddress = await platCont.adminsFactory();
    const aPsFactoryContract = await ethers.getContractAt("APfactory", aPsFactoryAddress);
    expect(await aPsFactoryContract.address).to.be.equal(aPsFactoryAddress);
  });

  it("Deberia crear una referencia a EmpresaFactory", async function() {
    const empresaFactoryAddress = await platCont.empresasFactory();
    const empresaFactoryContract = await ethers.getContractAt(
      "EmpresaFactory",
      empresaFactoryAddress
    );
    expect(empresaFactoryContract.address).to.be.equal(empresaFactoryAddress);
  });

  it("Deberia crear una referencia a ExpertoFactory", async function() {
    const expertoFactoryAddress = await platCont.expertosFactory();
    const expertoFactoryContract = await ethers.getContractAt(
      "EmpresaFactory",
      expertoFactoryAddress
    );
    expect(expertoFactoryContract.address).to.be.equal(expertoFactoryAddress);
  });
});