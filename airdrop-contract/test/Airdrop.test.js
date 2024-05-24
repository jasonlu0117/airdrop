const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");

describe("Airdrop", function () {

    /**
     * deploy AirdropImplementation and Airdrop contract, return the contract instances.
     * @returns 
     */
    async function deployAirdropFixture() {
        const { coboNFT, airdropNFT } = await deployNFTFixture()

        const [ manager, user, user2 ] = await ethers.getSigners();
        const Airdrop = await ethers.getContractFactory("Airdrop");
        const AirdropImplementation = await ethers.getContractFactory("AirdropImplementation");

        // deploy AirdropImplementation contract
        const airdropImplementation = await AirdropImplementation.deploy();
        // deploy Airdrop contract with AirdropImplementation.address
        const startTime = 1716134400;
        const endTime = 1716566400;
        const airdropProxy = await Airdrop.deploy(airdropImplementation.address, coboNFT.address, airdropNFT.address, startTime, endTime);
        const airdrop = AirdropImplementation.attach(airdropProxy.address);
        return { manager, user, user2, airdrop, airdropProxy, coboNFT, airdropNFT };
    }

    /**
     * deploy the mock CoboNFT and AirdropNFT contract, return the contract instance.
     */
    async function deployNFTFixture() {
        const CoboNFT = await ethers.getContractFactory("CoboNFT");
        const coboNFT = await CoboNFT.deploy();

        const AirdropNFT = await ethers.getContractFactory("AirdropNFT");
        const airdropNFT = await AirdropNFT.deploy();

        return { coboNFT, airdropNFT };
    }

    /**
     * deploy AirdropImplementation2 and update Airdrop contract implementation, return the contract instances.
     * @returns 
     */
    async function deployAndUpdateAirdropFixture() {
        const { coboNFT, airdropNFT } = await deployNFTFixture()

        const [ manager, user, user2 ] = await ethers.getSigners();
        const Airdrop = await ethers.getContractFactory("Airdrop");
        const AirdropImplementation = await ethers.getContractFactory("AirdropImplementation");

        // deploy AirdropImplementation contract
        const airdropImplementation = await AirdropImplementation.deploy();
        // deploy Airdrop contract with AirdropImplementation.address
        const startTime = 1716134400;
        const endTime = 1716566400;
        const airdropProxy = await Airdrop.deploy(airdropImplementation.address, coboNFT.address, airdropNFT.address, startTime, endTime);

        const AirdropImplementationV2 = await ethers.getContractFactory("AirdropImplementationV2");
        const airdropImplementationV2 = await AirdropImplementationV2.deploy();
        await airdropProxy.updateImplementation(airdropImplementationV2.address);
        const airdrop = airdropImplementationV2.attach(airdropProxy.address);
        return { manager, user, user2, airdrop, airdropProxy, coboNFT, airdropNFT };
    }


    /**
     * unit tests of deploy
     */
    describe("Deploy test", function () {
        describe("Deploy contract test", function () {
            it("Should the manager address in the contract match the deployer address", async function () {
                const { airdrop, manager } = await loadFixture(deployAirdropFixture);
                expect(await airdrop.manager()).to.equal(manager.address);
            });
        })

        describe("Update implementation contract test", function () {
            it("Should revert when update implementation with a invalid address", async function () {
                const { manager, airdropProxy } = await loadFixture(deployAirdropFixture);
                const error = 'Destination address is not a contract'
                await expect(airdropProxy.updateImplementation(manager.address))
                    .to.be.revertedWith(error);
            });

            it("Should update successfully when update implementation with a valid contract", async function () {
                const { airdropProxy } = await loadFixture(deployAirdropFixture);
                const AirdropImplementationV2 = await ethers.getContractFactory("AirdropImplementationV2");
                const airdropImplementationV2 = await AirdropImplementationV2.deploy();
                await airdropProxy.updateImplementation(airdropImplementationV2.address);
                var implementation = await airdropProxy.implementation();
                expect(implementation).to.equal(airdropImplementationV2.address);
            });
        })
    });

    /**
     * unit tests of action functions
     */
    describe("Action function test", function () {

        describe("Airdrop test", function () {
            it("Should revert when user claim without CoboNFT", async function () {
                const { airdrop, coboNFT, airdropNFT, manager, user, user2 } = await loadFixture(deployAirdropFixture);

                // calling deposit by the manager will result in an exception
                error = "Not a COBO NFT holder";
                await expect(airdrop.connect(user).claimAirdrop()).to.be.revertedWith(error);
            });

            it("Should airdrop token successfully when user claim airdrop", async function () {
                const { airdrop, coboNFT, airdropNFT, manager, user, user2 } = await loadFixture(deployAirdropFixture);

                await coboNFT.mint(user.address);
                await airdropNFT.mint(manager.address);
                await airdropNFT.setApprovalForAll(airdrop.address, true);

                await airdrop.depositAirdropNFTs([0]);

                var canClaim = await airdrop.connect(user).canClaimAirdrop(user.address);
                expect(canClaim).to.equal(true);

                var airdropNFTBefore = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTBefore).to.equal(0);

                await airdrop.connect(user).claimAirdrop();

                var airdropNFTAfter = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTAfter).to.equal(1);
            })

            it("Should revert when user claim airdrop for the second time", async function () {
                const { airdrop, coboNFT, airdropNFT, manager, user, user2 } = await loadFixture(deployAirdropFixture);

                await coboNFT.mint(user.address);
                await airdropNFT.mint(manager.address);
                await airdropNFT.setApprovalForAll(airdrop.address, true);

                await airdrop.depositAirdropNFTs([0]);

                var canClaim = await airdrop.connect(user).canClaimAirdrop(user.address);
                expect(canClaim).to.equal(true);

                var airdropNFTBefore = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTBefore).to.equal(0);

                await airdrop.connect(user).claimAirdrop();

                var airdropNFTAfter = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTAfter).to.equal(1);

                error = "Airdrop already claimed";
                await expect(airdrop.connect(user).claimAirdrop()).to.be.revertedWith(error);
            })

            it("Should revert when user claim airdrop but the airDropNFT amount is insufficient", async function () {
                const { airdrop, coboNFT, airdropNFT, manager, user, user2 } = await loadFixture(deployAirdropFixture);

                await coboNFT.mint(user.address);
                await coboNFT.mint(user2.address);
                await airdropNFT.mint(manager.address);
                await airdropNFT.setApprovalForAll(airdrop.address, true);

                await airdrop.depositAirdropNFTs([0]);

                var canClaim = await airdrop.connect(user).canClaimAirdrop(user.address);
                expect(canClaim).to.equal(true);

                var airdropNFTBefore = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTBefore).to.equal(0);

                await airdrop.connect(user).claimAirdrop();

                var airdropNFTAfter = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTAfter).to.equal(1);

                var canClaim = await airdrop.connect(user2).canClaimAirdrop(user2.address);
                expect(canClaim).to.equal(true);

                error = "Not enough NFTs for airdrop";
                await expect(airdrop.connect(user2).claimAirdrop()).to.be.revertedWith(error);
            })
        });

        describe("AirdropV2 test", function () {

            it("Should airdrop token successfully when user claim airdrop within the specified time", async function () {
                const { airdrop, coboNFT, airdropNFT, manager, user, user2 } = await loadFixture(deployAndUpdateAirdropFixture);

                await coboNFT.mint(user.address);
                await airdropNFT.mint(manager.address);
                await airdropNFT.setApprovalForAll(airdrop.address, true);

                await airdrop.depositAirdropNFTs([0]);

                await airdrop.setTimePeriod(3600);
                await airdrop.setClaimLimit(5);

                var canClaim = await airdrop.connect(user).canClaimAirdrop(user.address);
                expect(canClaim).to.equal(true);

                var airdropNFTBefore = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTBefore).to.equal(0);

                await airdrop.connect(user).claimAirdrop();

                var airdropNFTAfter = await airdropNFT.connect(user).balanceOf(user.address)
                expect(airdropNFTAfter).to.equal(1);
            })

            it("Should revert when user claim airdrop but not within the specified time", async function () {
                const { airdrop, coboNFT, airdropNFT, manager, user, user2 } = await loadFixture(deployAndUpdateAirdropFixture);

                await coboNFT.mint(user.address);
                await coboNFT.mint(user2.address);
                await airdropNFT.mint(manager.address);
                await airdropNFT.setApprovalForAll(airdrop.address, true);

                await airdrop.depositAirdropNFTs([0]);

                await airdrop.setTimePeriod(3600);
                await airdrop.setClaimLimit(5);
                await airdrop.setAirdropTime(1716134400, 1716220800)

                var canClaim = await airdrop.connect(user).canClaimAirdrop(user.address);
                expect(canClaim).to.equal(true);

                error = "Airdrop not active";
                await expect(airdrop.connect(user).claimAirdrop()).to.be.revertedWith(error);
            })
        });
    });

});