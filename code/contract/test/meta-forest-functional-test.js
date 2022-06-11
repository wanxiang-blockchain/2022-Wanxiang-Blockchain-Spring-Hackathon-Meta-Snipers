const AccessControl = artifacts.require("metaForestAccess");
const MetaForestTree = artifacts.require("MetaForestTree");
const MetaForestCarbonEmission = artifacts.require("MetaForestCarbonEmission");
const MetaForestCarbonEnergy = artifacts.require("MetaForestCarbonEnergy");
const MetaForestCore = artifacts.require("MetaForestCore");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const { expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const BN = web3.utils.BN;

const MASTER_ROLE = 2;

contract("meta-forest-test", function (accounts) {
    var metaForestTreeInstance = null;
    var metaForestCoreInstance = null;
    var carbonEnergyInstance = null;
    var carbonEmissionInstance = null;
    var accessControlInstance = null;
    var owner = null;
    var userOne = null;
    var userTwo = null;
    var userThree = null;
    var userFour = null;
    var userFive = null;

    const price = new BN(300000000000000);
    const maxNFTCanBuy = new BN(12);

    before("contract deploy", async function () {

        owner = accounts[0];
        userOne = accounts[1];
        userTwo = accounts[2];
        userThree = accounts[3];
        userFour = accounts[4];
        userFive = accounts[5];

        
        console.log("contracts deploying....");

        accessControlInstance = await deployProxy(AccessControl, [], { initializer: 'initialize' });

        metaForestTreeInstance = await deployProxy(MetaForestTree, ["MetaForest", "MFT", "https://ipfs.io/ipfs/Qma3eSoDiRanib6CPmqgwycCEWep6eZwDpuFN7jpHYaJbN", "https://ipfs.io/ipfs/QmV8infyiU18fYPovSquTTWtSKE3meareq6jNZQmA6ReWL", accessControlInstance.address, maxNFTCanBuy], { initializer: 'initialize' });

        carbonEnergyInstance = await deployProxy(MetaForestCarbonEnergy, [accessControlInstance.address], { initializer: 'initialize' });
        carbonEmissionInstance = await deployProxy(MetaForestCarbonEmission, [accessControlInstance.address, new BN(2)], { initializer: 'initialize' });

        metaForestCoreInstance = await deployProxy(MetaForestCore, [accessControlInstance.address, metaForestTreeInstance.address, carbonEnergyInstance.address, carbonEmissionInstance.address, maxNFTCanBuy], { initializer: 'initialize' });

        console.log("contracts deployed");

        // set role.
        await accessControlInstance.addRoleUser([MASTER_ROLE], [metaForestCoreInstance.address]);
        // set price.
        await metaForestCoreInstance.setPrice(price);
    });

    describe("get free tree", async function () {

        it("user get free tree success", async function () {
            await metaForestCoreInstance.getFreeNFT({ from : userOne });

            expect(await metaForestTreeInstance.ownerOf(maxNFTCanBuy.add(new BN(1)))).to.equal(userOne);
            expect((await metaForestTreeInstance.balanceOf(userOne)).toNumber()).to.equal(1);
            console.log("total free tree number = ", (await metaForestCoreInstance.getNFTHasCollected()).toNumber() - maxNFTCanBuy -1);      
        });

        it("user get free tree only once", async function () {
            await truffleAssert.reverts(
                metaForestCoreInstance.getFreeNFT({ from : userOne}),
                "has collected"
            );

            expect((await metaForestTreeInstance.balanceOf(userTwo)).toNumber()).to.equal(0);

            await metaForestCoreInstance.getFreeNFT({ from : userTwo });
            expect((await metaForestTreeInstance.balanceOf(userTwo)).toNumber()).to.equal(1);
        });
    });

    describe("buy tree", async function () {
        it("master role can mint tree success", async function () {
            let buyCount = 12;
            let treePrice = await metaForestCoreInstance.getPrice();
            await metaForestCoreInstance.buy(buyCount, { from : userOne, value : treePrice * buyCount });

            expect((await metaForestTreeInstance.balanceOf(userOne)).toNumber()).to.equal(13);
            let contract_balance = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
            expect(contract_balance).to.equal((treePrice * buyCount).toString());

            console.log("userOne tokenId list: ");
            
            let queryIndex = 0, index = 1;
            let result;
            do{
                result = await metaForestTreeInstance.tokenListOfOwner(userOne,queryIndex);
                for (var i = 0; i < result[0].length; i++) {
                    console.log("userOne the" + index + " tree tokenId = ", result[0][i].toNumber());
                    index++;
                }
                queryIndex += 10;
            }while(result[1]);
        });

        it("buy tree, but eth not enough", async function () {
            let treePrice = await metaForestCoreInstance.getPrice();
            await truffleAssert.reverts(
                metaForestCoreInstance.buy(1, { from : userOne, value : treePrice-1 }),
                "insufficient payment"
            );
        });

        it("buy tree, but NFTCanBuy is max", async function () {
            let treePrice = await metaForestCoreInstance.getPrice();
            await truffleAssert.reverts(
                metaForestCoreInstance.buy(1, { from : userOne, value : treePrice * 1 }),
                "insufficient balance of nft that can buy"
            );
        })

        it("general user mint nft will failed", async function () {
            await truffleAssert.reverts(
                metaForestTreeInstance.mint(userTwo, 1, { from : userTwo }),
                "msg's sender is not the admin or master"
            );
        });

        it("owner can mint nft success", async function () {
            await metaForestTreeInstance.mint(userTwo, 1000, { from : owner });

            expect((await metaForestTreeInstance.balanceOf(userTwo)).toNumber()).to.equal(2);
        });
    });

    describe("withdraw ETH from contract", async function () {
        let ethReceiver = accounts[9];

        it("withdraw failed if not owner", async function () {
            let eth1 = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
            await truffleAssert.reverts(
                metaForestCoreInstance.takeOutNativeToken(ethReceiver, new BN(eth1), { from: userOne }),
                "msg's sender is not the owner"
            );
        });

        it("withdraw failed if amount <= 0", async function () {
            await truffleAssert.reverts(
                metaForestCoreInstance.takeOutNativeToken(ethReceiver, new BN(0), { from: owner }),
                "the amount of funds withdrawn should greater than zero"
            );
        });

        it("withdraw failed if contract balance not enough", async function () {
            let ethBalance = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
            await truffleAssert.reverts(
                metaForestCoreInstance.takeOutNativeToken(ethReceiver, new BN(ethBalance+1), { from: owner }),
                "the amount of funds withdrawn must be less than the balance of contract"
            );
        });

        it("withdraw ETH success", async function () {
            let ReceiveBalance1 = await web3.eth.getBalance(ethReceiver).valueOf();
            console.log("receiver balance before withdraw: ", + web3.utils.fromWei(ReceiveBalance1, "ether") + " ETH" );
            let eth1 = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
            console.log("contract balance before withdraw: " + web3.utils.fromWei(eth1, "ether") + " ETH");


            await metaForestCoreInstance.takeOutNativeToken(ethReceiver, new BN(eth1), { from: owner });

            let ReceiveBalance2 = await web3.eth.getBalance(ethReceiver).valueOf();
            console.log("receiver balance after withdraw: ", + web3.utils.fromWei(ReceiveBalance2, "ether") + " ETH" );
            let eth2 = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
            console.log("contract balance after withdraw: " + web3.utils.fromWei(eth2, "ether") + " ETH");

            expect(Number(eth2)).to.equal(0);
            expect(ReceiveBalance2).to.equal(new BN(ReceiveBalance1).add(new BN(eth1)).toString());
        })
    });

    describe("get Carbon Energy", async function () {
        let amount = 2000;

        it("userOne get CarbonEnergy success", async function () {
            await carbonEnergyInstance.mint(userOne, amount, { from: owner });
            let CarbonEnergyforUserone = await carbonEnergyInstance.balanceOf(userOne);
            expect(CarbonEnergyforUserone.toNumber()).to.equal(amount);
        });

        it("get CarbonEnergy failed if role not Admin", async function () {
            const ROLE_ONE = 3;
            const ROLE_TWO = 4;
            let modifierRoles = [ROLE_ONE, ROLE_TWO];
            let newRoleUsers = [userThree, userFour];
            let result = await accessControlInstance.addRoleUser(modifierRoles,newRoleUsers);

            console.log("addRoleUser result is : ", result.receipt.status);
            expect(await accessControlInstance.HasRole(modifierRoles[0], userThree)).to.equal(true);
            expect(await accessControlInstance.HasRole(modifierRoles[1], userFour)).to.equal(true);

            await truffleAssert.reverts(
                carbonEnergyInstance.mint(userOne, amount, { from: userThree }),
                "msg's sender is not the admin"
            );
            
        });

        it("userThree set Admin, mint CarbonEnergy", async function () {
            const ADMIN_ROLE = 1;
            let modifierRoles = [ADMIN_ROLE];
            let newRoleUsers = [userThree];
            await accessControlInstance.addRoleUser(modifierRoles,newRoleUsers, { from : owner});
            expect(await accessControlInstance.HasRole(ADMIN_ROLE, userThree)).to.equal(true);

            await carbonEnergyInstance.mint(userOne, amount, { from : userThree });
            let CarbonEnergyforUserone = await carbonEnergyInstance.balanceOf(userOne);
            expect(CarbonEnergyforUserone.toNumber()).to.equal(amount * 2);
        });
    });

    describe("watering test", async function () {
        let userOneTokenId;
        let metaForest;

        before("data preparation", async function () {
            metaForest = metaForestCoreInstance.address;
            let result = await metaForestTreeInstance.tokenListOfOwner(userOne,0);
            userOneTokenId = result[0][0].toNumber();
            console.log("userOne tree tokenId: ", userOneTokenId);
        });

        it("userOne energyBalance isn`t enough to watering", async function () {
            let userOneEnergy = await carbonEnergyInstance.balanceOf(userOne);
            console.log("userOne energyBalance: ", userOneEnergy.toNumber());

            await truffleAssert.reverts(
                metaForestCoreInstance.watering(userOne, userOneTokenId, userOneEnergy+1),
                "insufficient carbo energy"
            );
        });

        it("watering, but not approve", async function () {
            let userOneEnergy = await carbonEnergyInstance.balanceOf(userOne);
            await truffleAssert.reverts(
                metaForestCoreInstance.watering(userOne, userOneTokenId, userOneEnergy-1),
                "ERC20: insufficient allowance"
            );
        });

        it("watering success, if approved", async function () {
            await carbonEnergyInstance.approve(metaForest, 2000000, { from: userOne});
            console.log("allowance=", (await carbonEnergyInstance.allowance(userOne, metaForest)).toNumber());

            let userOneEnergyBefore = await carbonEnergyInstance.balanceOf(userOne);
            console.log("before watering userOneEnergy is = ", userOneEnergyBefore.toNumber());
            await metaForestCoreInstance.watering(userOne, userOneTokenId, userOneEnergyBefore-1000);
            let userOneEnergyAfter = await carbonEnergyInstance.balanceOf(userOne);
            console.log("after  watering userOneEnergy is = ", userOneEnergyAfter.toNumber());
            expect(userOneEnergyAfter.toNumber()).to.equal(1000);
        });

        it("validate watering emit Event", async function () {
            let waterAmount = 100;
            expectEvent(
                await metaForestCoreInstance.watering(userOne, userOneTokenId, waterAmount),
                'Watering', {
                    account: userOne,
                    tokenId: userOneTokenId.toString(),
                    wateringAmount: waterAmount.toString(),
                }
            );
        });

    });

    describe("Carbon Emissions", async function () {
        let userOneTokenId = 13;

        it("increase Carbon Emission success", async function () {
            await carbonEmissionInstance.increaseCarbonEmissions(userOne, 200);
            console.log("lastDay carbonEmission time is: ",(await carbonEmissionInstance.lastUpdateOf(userOne)).toNumber());
            console.log("userOne total carbonEmission is: ",(await carbonEmissionInstance.totalBalanceOf(userOne)).toNumber());

            expect((await carbonEmissionInstance.lastBalanceOf(userOne)).toNumber()).to.equal(200);

            //make transaction, block Number will increase
            await carbonEnergyInstance.mint(userOne, 200, { from: owner });
            await metaForestCoreInstance.watering(userOne, userOneTokenId, 10);
            await metaForestCoreInstance.watering(userOne, userOneTokenId, 10);
            
            //The carbon emissions of users will disappear if they are not used for one day
            expect((await carbonEmissionInstance.lastBalanceOf(userOne)).toNumber()).to.equal(0);
        });
        
        it("increase Carbon Emissions Not more than 1 day", async function () {
            await carbonEmissionInstance.increaseCarbonEmissions(userOne, 200),
            await truffleAssert.reverts(
                carbonEmissionInstance.increaseCarbonEmissions(userOne, 200),
                "can't increase in limit time"
            );
        });

        it("increase Carbon Emission emit Event", async function () {
            let EmissionAmount = 200;
            //make transaction, block Number will increase
            await carbonEnergyInstance.mint(userOne, 200, { from: owner });
            await metaForestCoreInstance.watering(userOne, userOneTokenId, 10);

            expectEvent(
                await carbonEmissionInstance.increaseCarbonEmissions(userOne, 200),
                'Increase', {
                    user: userOne,
                    amount: EmissionAmount.toString(),
                }
            );
        });
    });

    describe("validate tree unhealthy and grower value", async function () {
        let userFiveTokenId;
        let metaForest;

        before("data preparation", async function () {
            metaForest = metaForestCoreInstance.address;
            await metaForestCoreInstance.getFreeNFT({ from : userFive });
            let result = await metaForestTreeInstance.tokenListOfOwner(userFive,0);
            userFiveTokenId = result[0][0].toNumber();
            console.log("userFiveTokenId = ", userFiveTokenId);
        });

        it("validate tree unhealthy and grower value", async function () {
            let UnhealthyAmount =  await metaForestCoreInstance.getUnhealthyAmount(userFiveTokenId);
            let GrowthAmount =  await metaForestCoreInstance.getGrowthAmount(userFiveTokenId);
            let userOneEnergy = await carbonEnergyInstance.balanceOf(userFive);
            console.log("userFive tree now UnhealthyAmount is: ", UnhealthyAmount.toNumber());
            console.log("userFive tree now GrowthAmount is: ", GrowthAmount.toNumber());
            console.log("userFive tree now CarbonEnergy is: ", userOneEnergy.toNumber());

            //increase carbon energy
            await carbonEnergyInstance.mint(userFive, 1000, { from: owner });
            await carbonEnergyInstance.approve(metaForest, 2000000, { from: userFive});
            await metaForestCoreInstance.watering(userFive, userFiveTokenId, 200);

            GrowthAmount = await metaForestCoreInstance.getGrowthAmount(userFiveTokenId)
            console.log("userFive tree now GrowthAmount is: ", GrowthAmount.toNumber());
            expect(GrowthAmount.toNumber()).to.equal(200);

            //increase carbon emissions
            await carbonEmissionInstance.increaseCarbonEmissions(userFive, 600);
            let attackAmount = await metaForestCoreInstance.getAttackAmount(userFive);
            console.log("can attack userFive tree Amount is: ", attackAmount.toNumber());
            expect(attackAmount.toNumber()).to.equal(600);

            //userOne attack tree of userFive
            await metaForestCoreInstance.attack(userFive, userFiveTokenId, 600, { from: userOne });
            attackAmount = await metaForestCoreInstance.getAttackAmount(userFive);
            console.log("can attack userFive tree Amount is: ", attackAmount.toNumber());
            expect(attackAmount.toNumber()).to.equal(0);
            
            UnhealthyAmount = await metaForestCoreInstance.getUnhealthyAmount(userFiveTokenId);
            console.log("userFive tree now UnhealthyAmount is: ", UnhealthyAmount.toNumber());
            expect(UnhealthyAmount.toNumber()).to.equal(600);

            //watering to userFive tree
            await metaForestCoreInstance.watering(userFive, userFiveTokenId, 500);
            GrowthAmount = await metaForestCoreInstance.getGrowthAmount(userFiveTokenId)
            UnhealthyAmount = await metaForestCoreInstance.getUnhealthyAmount(userFiveTokenId);
            console.log("userFive tree now GrowthAmount is: ", GrowthAmount.toNumber());
            console.log("userFive tree now UnhealthyAmount is: ", UnhealthyAmount.toNumber());
            expect(GrowthAmount.toNumber()).to.equal(200);
            expect(UnhealthyAmount.toNumber()).to.equal(100);
            
            //continue watering，tree healthy
            let waterAmount =  UnhealthyAmount.toNumber() + 1;
            await metaForestCoreInstance.watering(userFive, userFiveTokenId, waterAmount);
            GrowthAmount = await metaForestCoreInstance.getGrowthAmount(userFiveTokenId)
            UnhealthyAmount = await metaForestCoreInstance.getUnhealthyAmount(userFiveTokenId);
            console.log("userFive tree now GrowthAmount is: ", GrowthAmount.toNumber());
            console.log("userFive tree now UnhealthyAmount is: ", UnhealthyAmount.toNumber());
            expect(GrowthAmount.toNumber()).to.equal(201);
            expect(UnhealthyAmount.toNumber()).to.equal(0);
        });
    });
});

