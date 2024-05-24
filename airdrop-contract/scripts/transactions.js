const { ethers } = require("hardhat");

async function main() {
    
    const [ manager, user ] = await ethers.getSigners();

    var airdropAddress = "0x1F23A29864732400A89DE7a5E36c19F9D97B1731";
    var coboNFTAddress = "0xC85F5c12f6e492f36118Dc0DE22800524a5DEf4b";
    var airdropNFTAddress = "0xfB6E063d7120c0F1CeeA2d75F7687dA5D58E8FAd";

    // Retrieve the contract instance by using the proxy contract address
    const AirdropImplementation = await ethers.getContractFactory("AirdropImplementation");
    const airdropImplementation = await AirdropImplementation.attach(airdropAddress);

    // After deploying implementationV2, use this contract instance again
    const AirdropImplementationV2 = await ethers.getContractFactory("AirdropImplementationV2");
    const airdropImplementationV2 = await AirdropImplementationV2.attach(airdropAddress);

    const CoboNFT = await ethers.getContractFactory("CoboNFT");
    const coboNFT = await CoboNFT.attach(coboNFTAddress);
    
    const AirdropNFT = await ethers.getContractFactory("AirdropNFT");
    const airdropNFT = await AirdropNFT.attach(airdropNFTAddress);

    // mint cobo NFT
    // var txn = await coboNFT.mint(manager.address);
    // console.log("txn:", txn);

    // mint airdrop NFT
    // var txn = await airdropNFT.mint(manager.address);
    // console.log("txn:", txn);

    // approve airdrop NFT
    // var txn =  await airdropNFT.setApprovalForAll(airdropAddress, true);
    // console.log("txn:", txn);

    // deposit NFT to contract
    // var txn = await airdropImplementation.depositAirdropNFTs([2, 3, 4]);
    // console.log("txn:", txn);

    // get the value of canClaimAirdrop
    // var txn = await airdropImplementation.canClaimAirdrop(manager.address);
    // console.log("txn:", txn);

    // claim airdrop NFT
    // var txn = await airdropImplementation.claimAirdrop();
    // console.log("txn:", txn);

    // get balance of airdrop NFT
    var txn = await airdropNFT.balanceOf(manager.address);
    console.log("txn:", txn);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });