const { ethers } = require("hardhat");
const eData = require("./empresas_tests/empresa_data");


async function deployPlatContratacion() {
  const PlataformaContratacion = await ethers.getContractFactory("PlataformaContratacion");
  const platCont = await PlataformaContratacion.deploy();
  await platCont.deployed();
  return platCont;
}

async function deployAP(plataformaContratacion) {
  const aPsFactoryAddress = await plataformaContratacion.adminsFactory();
  const aPsFactoryContract = await ethers.getContractAt("APfactory", aPsFactoryAddress);
  const nombre = "Ayuntamiento de Madrid";
  const contacto = "917356523";
  const ubicacion = "Plaza de Cibeles";
  const admin1 = await aPsFactoryContract.createAP(
    nombre, contacto, ubicacion
  );
  await admin1.wait();
  const admin1Address = await aPsFactoryContract.getAP(h1.address);
  return await ethers.getContractAt("AP", admin1Address);
}

async function deployContrato(admin, tipoContrato, datosContrato) {
  let contratoData = Object.values(datosContrato);
  let c;
  if (tipoContrato === "menor") {
    c = "ContratoMenor";
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
  } else if (tipoContrato === "generico") {
    c = "ContratoGenerico";
    contratoData = abiEncoder.encode(["string", "uint256", "uint256", "string", "string[]", "string", "string"], [...contratoData]);
  }
  const contratoCreado = await admin.createContrato(tipoContrato, contratoData);
  const contratoAddress = (await contratoCreado.wait()).events[0].args.c;
  return await ethers.getContractAt(c, contratoAddress);
}

async function deployLicitacion(admin, tipoContrato, contratoData, tipoLicitacion, licitacionData) {
  const contratoContract = await deployContrato(admin, tipoContrato, contratoData);
  let lData = Object.values(licitacionData);
  lData = lData.map((value) => new Date(value).getTime() / 1000);
  lData = abiEncoder.encode(["uint256", "uint256", "uint256"], [...lData]);
  const licitacionCreada = await contratoContract.createLicitacion(tipoLicitacion, lData);
  const licitacionAddress = (await licitacionCreada.wait()).events[0].args.l;

  return await ethers.getContractAt(
    tipoLicitacion.charAt(0).toUpperCase() + tipoLicitacion.slice(1),
    licitacionAddress
  );
}

async function deployEmpresas(plataformContratacion) {
  const empresaFactoryAddress = await plataformContratacion.empresasFactory();
  const empresaFactoryContract = await ethers.getContractAt("EmpresaFactory", empresaFactoryAddress);
  const empresas = [];
  const e = Object.keys(eData);
  console.assert(e.length < 10);
  for (let i = 5; i < (5 + e.length); i++) {
    const empresa = await empresaFactoryContract.connect(await ethers.getSigner(i)).createEmpresa(
      ...Object.values(eData[e[i - 5]])
    );
    await empresa.wait();
    const empresaAddress = await empresaFactoryContract.getEmpresa((await ethers.getSigner(i)).address);
    empresas.push(empresaAddress);
  }
  return empresas;
}


module.exports = {
  deployPlatContratacion: deployPlatContratacion,
  deployAP: deployAP,
  deployContrato: deployContrato,
  deployLicitacion: deployLicitacion,
  deployEmpresas: deployEmpresas
};

