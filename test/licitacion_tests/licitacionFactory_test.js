const { expect } = require("chai");
const { ethers } = require("hardhat");
const lData = require("./licitacion_data");
const cData = require("../contratos_tests/contratos-data");
const deployHelper = require("../deploy-helpers");


describe("LicitacionFactory", async function() {
  before(async () => {
    const [h1, h2] = await ethers.getSigners();
    global.h1 = h1;
    global.h2 = h2;
    global.ADDRESS_0 = "0x0000000000000000000000000000000000000000";
    global.abiEncoder = new ethers.utils.AbiCoder();
    const PlataformaContratacion = await deployHelper.deployPlatContratacion();
    global.adminContract = await deployHelper.deployAP(PlataformaContratacion);
    global.contratoContract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
  });

  it("Deberia crear un proc. abierto desde un contrato generico y asociarlo", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    expect(await contrato1Contract.licitacion()).to.be.equal(ADDRESS_0);
    let licitacionData = Object.values(lData.abierto_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    const licitacionCreada = await contrato1Contract.createLicitacion("abierto", licitacionData);

    const abiertoAddress = (await licitacionCreada.wait()).events[0].args.l;
    expect(await contrato1Contract.licitacion()).to.be.equal(abiertoAddress);
  });

  it("Deberia revertir la creacion de un proc. cuando sea iniciado por una EOA NO propietaria", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    const contractAux = contrato1Contract.connect(h2);
    let licitacionData = Object.values(lData.abierto_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    await expect(
      contractAux.createLicitacion("abierto", licitacionData)
    ).to.be.revertedWith(
      "La licitacion debe ser abierta por el owner de la AP"
    );
  });

  it("Deberia revertir la creacion de un proc. si el contrato de origen NO existe", async function() {
    const aux = await ethers.getContractFactory("LicitacionFactory");
    const licitacionFactory = await aux.deploy();
    await licitacionFactory.deployed();

    await expect(licitacionFactory.createLicitacion("foo", abiEncoder.encode(["string"], ["foo"]))).to.be.reverted;
  });

  it("Deberia revertir la creacion de un proc. si el tipo de licitacion es incorrecto", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    let licitacionData = Object.values(lData.abierto_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("...", licitacionData)
    ).to.be.revertedWith("Tipo de licitacion incorrecto");
  });

  it("Deberia revertir la creacion de un proc. si ya existe una licitacion activa en ese contrato", async function() {
    const contrato1Contract = await deployHelper.deployContrato(
      adminGlobal, "generico",
      cData.contratoGenericoValorMenor2Millones
    );
    let licitacionData = Object.values(lData.simplificado_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256"], [...licitacionData]);

    await contrato1Contract.createLicitacion("simplificado", licitacionData);
    await expect(
      contrato1Contract.createLicitacion("simplificado", licitacionData)
    ).to.be.revertedWith("Ya existe una licitacion activa para este contrato");
  });
});