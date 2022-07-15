// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    const PlataformaContratacion = await hre.ethers.getContractFactory("PlataformaContratacion");
    const platCont = await PlataformaContratacion.deploy();
    await platCont.deployed();
    console.log("Desplegado Plataforma de Contratacion en: " + platCont.address);
    console.log("Desplegado Factoria de APs en: " + await platCont.adminsFactory());
    console.log("Desplegado Factoria de Empresas en: " + await platCont.empresasFactory());
    console.log("Desplegado Factoria de Expertos en: " + await platCont.expertosFactory());
    console.log("Desplegado el Token ERC20 Honesto en: " + await platCont.hon());
    console.log("Desplegado el Token ERC721 CP en: " + await platCont.cpNFT());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});