const { constants } = require("buffer");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');

async function main() {

    const [ manager ] = await ethers.getSigners();
    console.log("Deploying contracts with the manager:", manager.address);
    
    // await deployMockCoboNFT();
    var coboNFTAddress = "0xC85F5c12f6e492f36118Dc0DE22800524a5DEf4b";
    // await deployMockAirdropNFT();
    var airdropNFTAddress = "0xfB6E063d7120c0F1CeeA2d75F7687dA5D58E8FAd";

    // await deployAirdropImplementation();
    var airdropImplementationAddress = "0x376433402C0c236C09637B43a5b87a77717a7775";
    
    const startTime = 1716134400;
    const endTime = 1719676800;
    // await deployAirdrop(airdropImplementationAddress, coboNFTAddress, airdropNFTAddress, startTime, endTime);
    var airdropAddress = "0x1F23A29864732400A89DE7a5E36c19F9D97B1731";

    // await deployAirdropImplementationV2();
    // var airdropImplementationV2Address = "0xd48Fae1A62574A703D32E91306fCFb4B1F98AaF9";
    // await updateAirdropImplementation(airdropAddress, airdropImplementationV2Address);
}

async function deployAirdropImplementation() {
    // deploy implementation contract
    console.log("Start to deploy airdrop implementation contract.");
    const AirdropImplementation = await ethers.getContractFactory("AirdropImplementation");
    const airdropImplementation = await AirdropImplementation.deploy();
    console.log("airdrop implementation address:", airdropImplementation.address);
}

async function deployAirdrop(airdropImplementationAddress, coboNFTAddress, airdropNFTAddress, startTime, endTime) {
    // deploy contract
    console.log("Start to deploy airdrop contract.");
    const Airdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.deploy(airdropImplementationAddress, coboNFTAddress, airdropNFTAddress, startTime, endTime);
    console.log("airdrop address:", airdrop.address);
}

async function deployAirdropImplementationV2() {
    // deploy implementationV2 contract
    console.log("Start to deploy airdrop implementationV2 contract.");
    const AirdropImplementationV2 = await ethers.getContractFactory("AirdropImplementationV2");
    const airdropImplementationV2 = await AirdropImplementationV2.deploy();
    console.log("airdrop implementationV2 address:", airdropImplementationV2.address);
}

async function updateAirdropImplementation(airdropAddress, airdropImplementationV2Address) {
    // update implementation contract
    const Airdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.attach(airdropAddress);
    console.log("Start to update airdrop implementation contract.");
    await airdrop.updateImplementation(airdropImplementationV2Address);
    console.log("airdrop address:", airdrop.address);
}

async function deployMockCoboNFT() {
    // deploy mock cobo nft contract
    console.log("Start to deploy cobo nft contract.");
    const CoboNFT = await ethers.getContractFactory("CoboNFT");
    const coboNFT = await CoboNFT.deploy();
    console.log("cobo address:", coboNFT.address);
}

async function deployMockAirdropNFT() {
    // deploy mock airdrop nft contract
    console.log("Start to deploy airdrop nft contract.");
    const AirdropNFT = await ethers.getContractFactory("AirdropNFT");
    const airdropNFT = await AirdropNFT.deploy();
    console.log("airdrop address:", airdropNFT.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });