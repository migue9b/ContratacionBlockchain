const { expect } = require("chai");
const { ethers } = require("hardhat");
const cData = require("./contratos-data");
const deployHelper = require("../deploy-helpers");

describe("Contrato Factory", async function() {
  before(async () => {
    const [h1, h2] = await ethers.getSigners();
    global.h1 = h1;
    global.h2 = h2;
    const PlataformaContratacion = await deployHelper.deployPlatContratacion();
    global.admin1Contract = await deployHelper.deployAP(PlataformaContratacion);
    global.abiEncoder = new ethers.utils.AbiCoder();
  });

  it("Deberia crear un contrato generico", async function() {
    let contratoData = Object.values(cData.contratoGenerico);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
    const contratoCreado = await admin1Contract.createContrato("generico", contratoData);

    const contratoAddress = (await contratoCreado.wait()).events[0].args.c;
    const contratoContract = await ethers.getContractAt("ContratoGenerico", contratoAddress);
    expect((await admin1Contract.getContratos()).find(i => i === contratoAddress)).to.be.not.undefined;
    expect(await contratoContract.objeto()).to.be.equal(cData.contratoGenerico.objeto);
    expect(await contratoContract.presupuesto()).to.be.equal(cData.contratoGenerico.presupuesto);
    expect(await contratoContract.valorEstimado()).to.be.equal(cData.contratoGenerico.valorEstimado);
    expect(await contratoContract.plazoEjecucion()).to.be.equal(cData.contratoGenerico.plazoEjecucion);
    expect(await contratoContract.getCPVs()).to.be.deep.equal(cData.contratoGenerico.CPV);
    expect(await contratoContract.subtipo()).to.be.equal(cData.contratoGenerico.subtipo);
    expect(await contratoContract.adminPropietaria()).to.be.equal(admin1Contract.address);
  });

  it("Deberia revertir la creacion de un contrato cuando la address no es owner de la AP", async function() {
    let contratoData = Object.values(cData.contratoGenerico);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
    const apAux = admin1Contract.connect(h2);
    await expect(apAux.createContrato(...contratoData)).to.be.reverted;
  });

  it("Deberia revertir la creacion de un contrato generico superior a 12M de euros", async function() {
    let contratoData = Object.values(cData.contratoGenericoValorSuperior12Millones);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
    await expect(
      admin1Contract.createContrato("generico", contratoData)
    ).to.be.revertedWith("El valor estimado no puede superar los 12M de euros");
  });

  it("Deberia revertir la creacion de un contrato generico inferior a 40k euros", async function() {
    let contratoData = Object.values(cData.contratoGenericoValorInferior40K);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
    await expect(
      admin1Contract.createContrato("generico", contratoData)
    ).to.be.revertedWith(
      "El contrato debe ser de tipo menor y seguir sus regulaciones"
    );
  });

  it("Deberia marcar como armonizado un contrato generico con valor superior al estipulado", async function() {
    let contratoData = Object.values(cData.contratoGenericoArmonizado);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
    const contratoCreado = await admin1Contract.createContrato("generico", contratoData);

    const contratoAddress = (await contratoCreado.wait()).events[0].args.c;
    const contratoContract = await ethers.getContractAt("ContratoGenerico", contratoAddress);
    expect(await contratoContract.armonizado()).to.be.true;
  });

  it("Deberia crear un contrato menor", async function() {
    let contratoData = Object.values(cData.contratoMenor);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string", "address"],
      [...contratoData]);
    const contratoCreado = await admin1Contract.createContrato("menor", contratoData);

    const contratoAddress = (await contratoCreado.wait()).events[0].args.c;
    const contratoContract = await ethers.getContractAt("ContratoMenor", contratoAddress);
    expect((await admin1Contract.getContratos()).find(i => i === contratoAddress)).to.be.not.undefined;
    expect(await contratoContract.objeto()).to.be.equal(cData.contratoMenor.objeto);
    expect(await contratoContract.presupuesto()).to.be.equal(cData.contratoMenor.presupuesto);
    expect(await contratoContract.valorEstimado()).to.be.equal(cData.contratoMenor.valorEstimado);
    expect(await contratoContract.plazoEjecucion()).to.be.equal(cData.contratoMenor.plazoEjecucion);
    expect(await contratoContract.getCPVs()).to.be.deep.equal(cData.contratoMenor.CPV);
    expect(await contratoContract.subtipo()).to.be.equal(cData.contratoMenor.subtipo);
    expect(await contratoContract.adminPropietaria()).to.be.equal(admin1Contract.address);
    expect(await contratoContract.empresa()).to.be.equal(cData.contratoMenor.empresa);
  });

  it("Deberia revertir la creacion de un contrato menor cuando se superen los 40K euros", async function() {
    let contratoData = Object.values(cData.contratoMenorValorSuperior40K);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string", "address"],
      [...contratoData]);
    await expect(
      admin1Contract.createContrato("menor", contratoData)
    ).to.be.revertedWith(
      "Para crear un contrato menor el valor estimado deber ser inferior a 40K euros"
    );
  });

  it("Deberia revertir la creacion de un contrato si el tipo especificado es incorrecto", async function() {
    let contratoData = Object.values(cData.contratoGenerico);
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
    await expect(
      admin1Contract.createContrato("tipoMalEspecificado", contratoData)
    ).to.be.revertedWith("Tipo de contrato incorrecto");
  });
});