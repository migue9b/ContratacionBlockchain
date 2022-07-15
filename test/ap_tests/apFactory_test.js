const { expect } = require("chai");
const { ethers } = require("hardhat");
const deployHelper = require("../deploy-helpers");

describe("AP Factory", async function() {
  before(async () => {
    const [h1, h2] = await ethers.getSigners();
    global.h1 = h1;
    global.pr1 = await ethers.getDefaultProvider();
    global.PlataformaContratacion = await deployHelper.deployPlatContratacion();
  });
  it("Deberia crear una Administracion publica con unos datos concretos", async () => {
    const aPsFactoryAddress = await PlataformaContratacion.adminsFactory();
    const aPsFactoryContract = await ethers.getContractAt("APfactory", aPsFactoryAddress);

    const nombre = "Ayuntamiento de Madrid";
    const contacto = "917356523";
    const ubicacion = "Plaza de Cibeles";
    const admin1 = await aPsFactoryContract.createAP(
      nombre, contacto, ubicacion
    );
    await admin1.wait();
    const admin1Address = await aPsFactoryContract.getAP(h1.address);
    const admin1Contract = await ethers.getContractAt("AP", admin1Address);
    expect(await admin1Contract.nombre()).to.be.equal(nombre);
    expect(await admin1Contract.contacto()).to.be.equal(contacto);
    expect(await admin1Contract.ubicacion()).to.be.equal(ubicacion);
    expect(await admin1Contract.owner()).to.be.equal(h1.address);
  });

  it("Deberia revertir la creacion de una Administracion si el owner ya existe", async function() {
    await expect(
      deployHelper.deployAP(PlataformaContratacion)
    ).to.be.revertedWith("Ya existe una AP vinculada a esta address");
  });

  it("Deberia revertir la creacion de una Administracion cuando ya exista otra entidad con el mismo owner", async function() {
    /*Creacion de una empresa con Signer 1 de Hardhat*/
    const empresasFactoryAddress = await PlataformaContratacion.empresasFactory();
    let empresasFactoryContract = await ethers.getContractAt("EmpresaFactory", empresasFactoryAddress);
    empresasFactoryContract = empresasFactoryContract.connect(
      await ethers.getSigner(1)
    );
    const nombre = "Cementos Garcia";
    const contacto = "658456523";
    const ubicacion = "Poligono Industrial 34, Coslada";
    await empresasFactoryContract.createEmpresa(
      nombre,
      contacto,
      ubicacion
    );
    /*Creacion de una administracion con Signer 1 de Hardhat y comprobacion de revert*/
    let adminContractAux = await PlataformaContratacion.adminsFactory();
    adminContractAux = await ethers.getContractAt("APfactory", adminContractAux);
    adminContractAux = adminContractAux.connect(await ethers.getSigner(1));
    await expect(
      adminContractAux.createAP("foo", "tee", "maa")
    ).to.be.revertedWith("Esta address ya es owner de otra entidad");
  });
});