const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const lData = require("./licitacion_data");
const cData = require("../contratos_tests/contratos-data");
const pujasData = require("./pujas-data");
const evalData = require("./evaluacion-data");
const deployHelper = require("../deploy-helpers");


describe("Licitacion - Proc. Abierto", async function() {
  before(async () => {
    const [h1, h2] = await ethers.getSigners();
    global.h1 = h1;
    global.h2 = h2;
    global.ADDRESS_0 = "0x0000000000000000000000000000000000000000";
    global.abiEncoder = new ethers.utils.AbiCoder();
    const PlataformaContratacion = await deployHelper.deployPlatContratacion();
    global.adminGlobal = await deployHelper.deployAP(PlataformaContratacion);
    global.contratoGlobal = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    global.empresasGlobal = await deployHelper.deployEmpresas(PlataformaContratacion);
    global.HonestoGlobal = await PlataformaContratacion.hon();
    /* Creacion de 10 expertos de entre los signers 10-20, para los procedimientos abiertos */
    const expertoFactory = await (
      await ethers.getContractAt(
        "PlataformaContratacion",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      )
    ).expertosFactory();
    const expertoFactoryContract = await ethers.getContractAt("ExpertoFactory", expertoFactory);
    global.expertosGlobal = [];
    for (let i = 10; i < 20; i++) {
      await expertoFactoryContract.connect(await ethers.getSigner(i)).createExperto();
      expertosGlobal.push(await expertoFactoryContract.getExperto((await ethers.getSigner(i)).address));
    }
  });

  it("Deberia crear un proc. abierto con unos valores concretos", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    let licitacionData = Object.values(lData.abierto_fechas_correctas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    const licitacionCreada = await contrato1Contract.createLicitacion("abierto", licitacionData);

    const abiertoAddress = (await licitacionCreada.wait()).events[0].args.l;

    const abiertoContract = await ethers.getContractAt("Abierto", abiertoAddress);
    expect(await abiertoContract.adminPublica()).to.be.equal(await contrato1Contract.adminPropietaria());
    expect(await abiertoContract.contratoAsociado()).to.be.equal(contrato1Contract.address);
    expect(await abiertoContract.estadoActual()).to.be.equal(0);
    expect(
      new Date((await abiertoContract.fechaApertura()).toNumber() * 1000)
    ).to.be.deep.equal(new Date(lData.abierto_fechas_correctas.fApertura));
    expect(
      new Date((await abiertoContract.fechaCierreOfertas()).toNumber() * 1000)
    ).to.be.deep.equal(new Date(lData.abierto_fechas_correctas.fCierreOfertas));
    expect(
      (await abiertoContract.fechaCierreRevelarOfertas()).toNumber() * 1000
    ).to.be.deep.equal(
      new Date(
        lData.abierto_fechas_correctas.fCierreOfertas).getTime() +
      (await abiertoContract.REVELAR_OFERTAS()).toNumber() * 1000
    );
    expect(
      new Date((await abiertoContract.fechaCierreEvaluacion()).toNumber() * 1000)
    ).to.be.deep.equal(new Date(lData.abierto_fechas_correctas.fCierreEvaluacion));
    expect(await abiertoContract.garantiaProvisional()).to.be.equal(
      (3 * (await contrato1Contract.presupuesto())) / 100
    );
  });

  it("Deberia revertir la creacion de un proc. abierto cuando el numero de parametros sea incorrecto", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    const fA = new Date("01/21/2023").getTime() / 1000;
    const fCO = new Date("02/21/2023").getTime() / 1000;
    const licitacionData = abiEncoder.encode(["uint256", "uint256"], [fA, fCO]);
    await expect(contrato1Contract.createLicitacion("abierto", licitacionData)).to.be.reverted;
  });

  it("Deberia revertir la creacion de un proc. abierto cuando fCierreEvaluacion sea anterior a fCOfertas", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    let licitacionData = Object.values(lData.abierto_fCEval_menor_que_fCOfertas);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("abierto", licitacionData)
    ).to.be.revertedWith(
      "La fecha de cierre de evaluacion debe ser superior a fCierreOfertas + REVELAR_OFERTAS + 7 dias"
    );
  });

  it("Deberia revertir la creacion de un proc. abierto cuando la fCOfertas sea anterior a la de apertura", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    let licitacionData = Object.values(lData.abierto_fCOfertas_menor_que_fApertura);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("abierto", licitacionData)
    ).to.be.revertedWith(
      "La fecha de cierre de ofertas debe ser posterior a la apertura"
    );
  });

  it("Deberia revertir la creacion de un proc. abierto cuando al fApertura sea anterior a la fecha actual", async function() {
    const contrato1Contract = await deployHelper.deployContrato(adminGlobal, "generico", cData.contratoGenerico);
    let licitacionData = Object.values(lData.abierto_fApertura_menor_que_fActual);
    licitacionData = licitacionData.map((value) => new Date(value).getTime() / 1000);
    licitacionData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...licitacionData]);
    await expect(
      contrato1Contract.createLicitacion("abierto", licitacionData)
    ).to.be.revertedWith("La fecha de apertura debe ser posterior a la actual");
  });

  /**
   * Estados de la licitacion
   */

  it("Deberia revertir la llamada a Pujar cuando el estado actual no sea RecepcionOfertas", async function() {
    const licitacionAux = await deployHelper.deployLicitacion(
      adminGlobal,
      "generico",
      cData.contratoGenerico,
      "abierto",
      lData.abierto_fechas_correctas
    );
    // Estado Preparacion
    await expect(
      licitacionAux.pujar(
        ethers.utils.keccak256("0x1234"),
        empresasGlobal[0]
      )
    ).to.be.revertedWith("OperacionInvalidaEnEstadoActual");

    let lapsofechas =
      Math.floor((new Date(lData.abierto_fechas_correctas.fCierreOfertas).getTime() / 1000) - new Date().getTime() / 1000);

    // Estado RevelerOfertas
    await network.provider.send("evm_increaseTime", [
      lapsofechas + 3 * 24 * 3600 // se incrementa el tiempo el lapso entre la fApertura y la fecha actual, mas 3 dias
    ]);
    await expect(
      licitacionAux.pujar(
        ethers.utils.keccak256("0x1234"),
        empresasGlobal[0]
      )
    ).to.be.revertedWith("OperacionInvalidaEnEstadoActual");

    // Estado Evaluacion
    await network.provider.send("evm_increaseTime", [
      lapsofechas + 3 * 24 * 3600
    ]);
    await expect(
      licitacionAux.pujar(
        ethers.utils.keccak256("0x1234"),
        empresasGlobal[0]
      )
    ).to.be.revertedWith("OperacionInvalidaEnEstadoActual");

    // Estado Adjudicacion
    resetBlockTimestamp();
    lapsofechas =
      Math.floor((new Date(lData.abierto_fechas_correctas.fCierreEvaluacion).getTime() / 1000) - new Date().getTime() / 1000);
    await network.provider.send("evm_increaseTime", [
      lapsofechas + 3 * 24 * 3600
    ]);
    await expect(
      licitacionAux.pujar(
        ethers.utils.keccak256("0x1234"),
        empresasGlobal[0]
      )
    ).to.be.revertedWith("OperacionInvalidaEnEstadoActual");
    resetBlockTimestamp();
  });

  it("Deberia completar el flujo completo de un procedimiento abierto de Licitacion", async function() {
    const licitacion = await deployHelper.deployLicitacion(
      adminGlobal,
      "generico",
      cData.contratoGenerico,
      "abierto",
      lData.abierto_fechas_correctas
    );

    // FASE RECEPCION OFERTAS
    // se modifica el tiempo para situarlo en el periodo de Recepcionfertas
    let lapsofechas =
      Math.floor((new Date(lData.abierto_fechas_correctas.fApertura).getTime() / 1000) - new Date().getTime() / 1000);
    await network.provider.send("evm_increaseTime", [
      lapsofechas
    ]);

    // Se pujan tres ofertas de tres empresas distintas
    let oferta1 = ethers.utils.solidityKeccak256(["address", "string", "uint256", "string"], [
      ...Object.values(pujasData.puja1)
    ]);
    let oferta2 = ethers.utils.solidityKeccak256(["address", "string", "uint256", "string"], [
      ...Object.values(pujasData.puja2)
    ]);
    let oferta3 = ethers.utils.solidityKeccak256(["address", "string", "uint256", "string"], [
      ...Object.values(pujasData.puja3)
    ]);
    const honContract = await ethers.getContractAt("Honesto", HonestoGlobal);
    // transferencia de fondos a las tres empresas
    await honContract.transfer((await _signer(5)).address, 10000000);
    await honContract.transfer((await _signer(6)).address, 10000000);
    await honContract.transfer((await _signer(7)).address, 10000000);
    // aprobacion de gasto de fondos al Smart Contract 'licitacion'
    await honContract.connect(await _signer(5)).approve(licitacion.address, await licitacion.garantiaProvisional());
    await honContract.connect(await _signer(6)).approve(licitacion.address, await licitacion.garantiaProvisional());
    await honContract.connect(await _signer(7)).approve(licitacion.address, await licitacion.garantiaProvisional());
    // puja
    await licitacion.connect(await _signer(5)).pujar(oferta1, empresasGlobal[0]);
    await licitacion.connect(await _signer(6)).pujar(oferta2, empresasGlobal[1]);
    await licitacion.connect(await _signer(7)).pujar(oferta3, empresasGlobal[2]);

    expect(await licitacion.pujasOcultas(empresasGlobal[0])).to.be.equal(oferta1);
    expect(await licitacion.pujasOcultas(empresasGlobal[1])).to.be.equal(oferta2);
    expect(await licitacion.pujasOcultas(empresasGlobal[2])).to.be.equal(oferta3);

    // FASE REVELAR OFERTAS
    // modificacion del tiempo para situarlo en el periodo correcto
    await resetBlockTimestamp();
    lapsofechas =
      Math.floor((new Date(lData.abierto_fechas_correctas.fCierreOfertas).getTime() / 1000) - new Date().getTime() / 1000);
    await network.provider.send("evm_increaseTime", [
      lapsofechas + 1 // aumenta un segundo
    ]);

    // cada empresa revela su oferta
    await licitacion.connect(await _signer(5)).revelarOferta(Object.values(pujasData.puja1), empresasGlobal[0]);
    await licitacion.connect(await _signer(6)).revelarOferta(Object.values(pujasData.puja2), empresasGlobal[1]);
    await licitacion.connect(await _signer(7)).revelarOferta(Object.values(pujasData.puja3), empresasGlobal[2]);

    // FASE EVALUAR
    // se aumenta en 3 dias el tiempo(3 dias es el periodo de revelado de ofertas)
    await network.provider.send("evm_increaseTime", [
      3 * 24 * 3600
    ]);

    // los 5 expertos seleccionados evalúan cada una de las ofertas
    const expertos = await licitacion.getExpertos();
    const evaluaciones = Object.values(evalData);

    for (let i = 0; i < 5; i++) {
      const expOwner = await (await ethers.getContractAt("Experto", expertos[i])).owner();
      await licitacion
        .connect(await _signer(expOwner))
        .evaluar(Object.values(evaluaciones[i]), expertos[i]);
    }

    expect(
      await licitacion.getCalificacionExperto(empresasGlobal[0], expertos[0])
    ).to.be.equal(evalData.experto1.eval1.valoracion * 100);
    expect(
      await licitacion.getCalificacionExperto(empresasGlobal[1], expertos[0])
    ).to.be.equal(evalData.experto1.eval2.valoracion * 100);
    expect(
      await licitacion.getCalificacionExperto(empresasGlobal[2], expertos[0])
    ).to.be.equal(evalData.experto1.eval3.valoracion * 100);

    // FASE ADJUDICAR
    // reset de tiempo y se vuelve a calcular
    await resetBlockTimestamp();
    lapsofechas =
      Math.floor((new Date(lData.abierto_fechas_correctas.fCierreEvaluacion).getTime() / 1000) - new Date().getTime() / 1000);
    await network.provider.send("evm_increaseTime", [
      lapsofechas + 1 // aumenta un segundo
    ]);

    const a = await licitacion.adjudicar();
    expect((await a.wait()).events[3].args.empresa).to.be.equal(
      (await licitacion.mejorOferta())[0][0]
    );

    await resetBlockTimestamp();
  });
});


function getFormatedDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

async function resetBlockTimestamp() {
  const blockNumber = ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  const currentTimestamp = Math.floor(new Date().getTime() / 1000);
  const secondsDiff = currentTimestamp - block.timestamp;
  await ethers.provider.send("evm_increaseTime", [secondsDiff]);
  await ethers.provider.send("evm_mine", []);
}

async function _signer(s) {
  return await ethers.getSigner(s);
}