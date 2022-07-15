const { expect } = require("chai");
const { ethers } = require("hardhat");
const lData = require("./licitacion_data");
const cData = require("../contratos_tests/contratos-data");
const deployHelper = require("../deploy-helpers");


describe("Licitacion - Proc. Simplificado", async function() {
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

  it("Deberia crear un proc. simplificado con unos valores concretos", async function() {
    const contrato1Contract = await deployHelper.deployContrato(
      adminGlobal, "generico",
      cData.contratoGenericoValorMenor2Millones
    );
    let licitacionData = Object.values(lData.simplificado_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256"], [...licitacionData]);
    const licitacionCreada = await contrato1Contract.createLicitacion("simplificado", licitacionData);

    const simplificadoAddress = (await licitacionCreada.wait()).events[0].args.l;
    const simplificadoContract = await ethers.getContractAt("Simplificado", simplificadoAddress);
    expect(await simplificadoContract.adminPublica()).to.be.equal(await contrato1Contract.adminPropietaria());
    expect(await simplificadoContract.contratoAsociado()).to.be.equal(contrato1Contract.address);
    expect(await simplificadoContract.estadoActual()).to.be.equal(0);
    expect(
      new Date((await simplificadoContract.fechaApertura()).toNumber() * 1000)
    ).to.be.deep.equal(new Date(lData.simplificado_fechas_correctas.fApertura));
    expect(
      new Date((await simplificadoContract.fechaCierreOfertas()).toNumber() * 1000)
    ).to.be.deep.equal(new Date(lData.simplificado_fechas_correctas.fCierreOfertas));
    expect(
      (await simplificadoContract.fechaCierreRevelarOfertas()).toNumber() * 1000
    ).to.be.deep.equal(
      new Date(
        lData.simplificado_fechas_correctas.fCierreOfertas).getTime() +
      (await simplificadoContract.REVELAR_OFERTAS()).toNumber() * 1000
    );
    expect(
      new Date((await simplificadoContract.fechaCierreEvaluacion()).toNumber() * 1000)
    ).to.be.deep.equal(new Date(lData.simplificado_fechas_correctas.fCierreOfertas));
  });

  it("Deberia revertir la creacion de un proc. simplificado cuando el numero de parametros sea incorrecto", async function() {
    const contrato1Contract = await deployHelper.deployContrato(
      adminGlobal,
      "generico",
      cData.contratoGenericoValorMenor2Millones
    );
    const foo = 1111111111111111;
    const licitacionData = abiEncoder.encode(["uint256"], [foo]);
    await expect(contrato1Contract.createLicitacion("simplificado", licitacionData)).to.be.reverted;
  });

  it("Deberia revertir la creacion de un proc. simplificado cuando el valor estimado supere los 2M euros", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    let licitacionData = Object.values(lData.simplificado_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("simplificado", licitacionData)
    ).to.be.revertedWith("Presupuesto superior a 2M euros");
  });

  it("Deberia revertir la creacion de un proc. simplificado cuando fCierreOfertas sea anterior a la de apertura", async function() {
    const contrato1Contract = await deployHelper.deployContrato(
      adminGlobal, "generico",
      cData.contratoGenericoValorMenor2Millones
    );
    let licitacionData = Object.values(lData.simplificado_fCOfertas_menor_que_fApertura);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("simplificado", licitacionData)
    ).to.be.revertedWith(
      "La fecha de cierre de ofertas debe ser posterior a la apertura"
    );
  });

  it("Deberia revertir la creacion de un proc. simplificado cuando la fecha apertura sea anterior a la actual", async function() {
    const contrato1Contract = await deployHelper.deployContrato(
      adminGlobal, "generico",
      cData.contratoGenericoValorMenor2Millones
    );
    let licitacionData = Object.values(lData.simplificado_fApertura_menor_que_fActual);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("simplificado", licitacionData)
    ).to.be.revertedWith("La fecha de apertura debe ser posterior a la actual");
  });

  it("Deberia revertir la creacion de un proc. simplificado cuando el plazo de ofertas supere los 20 dias", async function() {
    const contrato1Contract = await deployHelper.deployContrato(
      adminGlobal, "generico",
      cData.contratoGenericoValorMenor2Millones
    );
    let licitacionData = Object.values(lData.simplificado_plazoOfertas_mayor_20dias);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("simplificado", licitacionData)
    ).to.be.revertedWith("El plazo de ofertas es superior a 20 dias");
  });
});