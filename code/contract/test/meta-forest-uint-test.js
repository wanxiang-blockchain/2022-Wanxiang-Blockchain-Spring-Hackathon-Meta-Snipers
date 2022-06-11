
const AccessControl = artifacts.require("metaForestAccess");
const MetaForestTree = artifacts.require("MetaForestTree");
const MetaForestCarbonEmission = artifacts.require("MetaForestCarbonEmission");
const MetaForestCarbonEnergy = artifacts.require("MetaForestCarbonEnergy");
const MetaForestCore = artifacts.require("MetaForestCore");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');


const MASTER_ROLE = 2;
const MINTER_ROLE = 3;
const CONSUMER_ROLE = 4;
const TESTER_ROLE = 5;
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("meta-forest-test", function(accounts) {
    var metaForestTreeInstance = null;
    var metaForestCoreInstance = null;
    var carbonEnergyInstance = null;
    var carbonEmissionInstance = null;
    var accessControlInstance = null;
    var userOne = null;
    var userTwo = null;

    const price = new BN(300000000000000);
    const cost = new BN(900000000000000);
    const maxNFTCanBuy = new BN(8000);

    const tokenId = new BN(100);
    const normalNFTId = new BN(8001);

    const countZero = new BN(0);
    const countThree = 3;
    const countTwenty = 20;
    const queryIndex = new BN(0);
    const newBaseUrl = "http://newBaseUrl.com/";

    before("contract deploy", async function() {
        owner = accounts[0];
        userOne = accounts[1];
        userTwo = accounts[2];

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

    it("mint one NFT to userOne", async function() {
        await metaForestTreeInstance.mint(userOne, tokenId);
        let balance = await metaForestTreeInstance.balanceOf(userOne);
        assert.equal(balance.toNumber(), 1, "balance error");
    });

    it("purchase 3 NFT by userOne", async function() {
        await metaForestCoreInstance.buy(countThree, { from: userOne, value: cost });
        let balance = await metaForestTreeInstance.balanceOf(userOne);
        assert.equal(balance.toNumber(), 4, "balance error");
    });

    it("get token list of userOne", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userOne, queryIndex);
        assert.equal(result[0].length, 4, "length of result error");
        assert.equal(result[1], false, "boolean value error");
        assert.equal(result[0][0].toNumber(), 100, "the value of index error");
        assert.equal(result[0][2].toNumber(), 1, "the value of index error");
        assert.equal(result[0][3].toNumber(), 2, "the value of index error");
    });

    it("getFreeNFT by userTwo", async function() {
        await metaForestCoreInstance.getFreeNFT({ from: userTwo });
    });

    it("get token uri", async function() {
        let normal_uri = await metaForestTreeInstance.tokenURI(normalNFTId);
        console.log("normal NFT url:", normal_uri);
        let legend_uri = await metaForestTreeInstance.tokenURI(tokenId);
        console.log("legend NFT url:", legend_uri);
    });

    it("getFreeNFT by userTwo twice", async function() {
        await truffleAssert.reverts(metaForestCoreInstance.getFreeNFT({ from: userTwo }), "msg'sender has collected");
    });

    it("purchase 0 NFT with insufficient balance", async function() {
        await truffleAssert.reverts(metaForestCoreInstance.buy(countZero, { from: userTwo, value: cost }), "the quantity purchased must be greater than zero");
    });

    it("purchase 20 NFT with insufficient balance", async function() {
        await truffleAssert.reverts(metaForestCoreInstance.buy(countTwenty, { from: userTwo, value: cost }), "insufficient payment");
    });

    it("get token list of userTwo", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userTwo, queryIndex);
        assert.equal(result[0].length, 1, "length of result error");
        assert.equal(result[1], false, "boolean value error");
        assert.equal(result[0][0].toNumber(), 8001, "the value of index error");
    });

    it("mint 500 carbon energy to userOne", async function() {
        await carbonEnergyInstance.mint(userOne, 500);
        let balance = await carbonEnergyInstance.balanceOf(userOne);
        assert.equal(balance.toNumber(), 500, "balance error");

        await carbonEnergyInstance.mint(owner, 900);
        balance = await carbonEnergyInstance.balanceOf(owner);
        assert.equal(balance.toNumber(), 900, "balance error");

        await truffleAssert.reverts(carbonEnergyInstance.burn(userOne, 500), 'ERC20: insufficient allowance');

    });

    it("increase 500 carbon emissions to userOne", async function() {
        await carbonEmissionInstance.increaseCarbonEmissions(userOne, 500);

        let lastBalance = await carbonEmissionInstance.lastBalanceOf(userOne);
        assert.equal(lastBalance.toNumber(), 500, "balance error");

        let totalBalance = await carbonEmissionInstance.totalBalanceOf(userOne);
        assert.equal(totalBalance.toNumber(), 500, "balance error");

        await truffleAssert.reverts(carbonEmissionInstance.increaseCarbonEmissions(userOne, 500), 'can\'t increase in limit time')
        totalBalance = await carbonEmissionInstance.totalBalanceOf(userOne);
        assert.equal(totalBalance.toNumber(), 500, "balance error");
    });

    it("spend carbon energy to watering", async function() {

        await carbonEnergyInstance.approve(metaForestCoreInstance.address, 9000, { from: userOne });
        await carbonEnergyInstance.approve(metaForestCoreInstance.address, 9000);
        await metaForestCoreInstance.watering(owner, 100, 500);
        await metaForestCoreInstance.watering(userOne, 100, 500);

        let balance = await carbonEnergyInstance.balanceOf(owner);
        assert.equal(balance.toNumber(), 400, "balance error");

        balance = await carbonEnergyInstance.balanceOf(userOne);
        assert.equal(balance.toNumber(), 0, "balance error");

        growthAmount = await metaForestCoreInstance.getGrowthAmount(100);
        assert.equal(growthAmount.toNumber(), 1000, "growthAmount error");
    });


    it("attack with carbon emissions", async function() {
        await carbonEmissionInstance.increaseCarbonEmissions(userOne, 500);
        let attackAmount = await metaForestCoreInstance.getAttackAmount(userOne);
        assert.equal(attackAmount.toNumber(), 500, "attackAmount error");

        await metaForestCoreInstance.attack(userOne, 100, 500);

        attackAmount = await metaForestCoreInstance.getAttackAmount(userOne);
        assert.equal(attackAmount.toNumber(), 0, "attackAmount error");

        let UnhealthyAmount = await metaForestCoreInstance.getUnhealthyAmount(100);
        assert.equal(UnhealthyAmount.toNumber(), 500, "UnhealthyAmount error");

        await metaForestCoreInstance.watering(owner, 100, 400);

        UnhealthyAmount = await metaForestCoreInstance.getUnhealthyAmount(100);
        assert.equal(UnhealthyAmount.toNumber(), 100, "UnhealthyAmount error");

    });

    // root check.
    it("update core by userOne", async function() {
        await truffleAssert.reverts(metaForestCoreInstance.updateTree(userOne, { from: userOne }), 'msg\'s sender is not the owner');
    });

    it("update access by userOne", async function() {
        await truffleAssert.reverts(metaForestCoreInstance.updateAccess(userOne, { from: userOne }), 'msg\'s sender is not the owner');
        await truffleAssert.reverts(metaForestTreeInstance.updateAccess(userOne, { from: userOne }), 'msg\'s sender is not the owner');
    });

    it("update base url by userOne", async function() {
        await truffleAssert.reverts(metaForestTreeInstance.setBaseUrl(newBaseUrl, newBaseUrl, { from: userOne }), 'msg\'s sender is not the admin');
    });

    it("set price by userOne", async function() {
        await truffleAssert.reverts(metaForestCoreInstance.setPrice(price, { from: userOne }), 'msg\'s sender is not the admin');
    });

    it("mint by userOne", async function() {
        await truffleAssert.reverts(carbonEnergyInstance.mint(userOne, countThree, { from: userOne }), 'msg\'s sender is not the admin');
    });

    it("increaseCarbonEmissions by userOne", async function() {
        await truffleAssert.reverts(carbonEmissionInstance.increaseCarbonEmissions(userOne, countThree, { from: userOne }), 'msg\'s sender is not the admin');
    });

    it("withdraw funds by userOne", async function() {
        let amount = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
        await truffleAssert.reverts(metaForestCoreInstance.takeOutNativeToken(owner, amount, { from: userOne }), 'msg\'s sender is not the owner');
    });

    // withdraw funds.
    it("withdraw funds", async function() {
        let amount = await web3.eth.getBalance(metaForestCoreInstance.address).valueOf();
        await metaForestCoreInstance.takeOutNativeToken(owner, amount);
    });

    it("add and remove role", async function() {
        //test add role
        await truffleAssert.reverts(accessControlInstance.addRoleUser([MINTER_ROLE], [userTwo], { from: userTwo }), "is missing role")
        hasrole = await accessControlInstance.HasRole(MINTER_ROLE, userOne)
        assert.equal(hasrole, false, "user has unexpect role")
        await accessControlInstance.addRoleUser([MINTER_ROLE], [userOne]);
        hasrole = await accessControlInstance.HasRole(MINTER_ROLE, userOne)
        assert.equal(hasrole, true, "user does not have expect role")

        //add more role
        await accessControlInstance.addRoleUser([CONSUMER_ROLE, CONSUMER_ROLE, TESTER_ROLE], [userTwo, userOne, userOne]);
        hasrole = await accessControlInstance.HasRole(CONSUMER_ROLE, userOne)
        assert.equal(hasrole, true, "user does not have expect role")
        // remove role
        await accessControlInstance.removeRoleUser([CONSUMER_ROLE, MINTER_ROLE], [userOne, userOne]);
        hasrole = await accessControlInstance.HasRole(CONSUMER_ROLE, userOne)
        assert.equal(hasrole, false, "user has unexpect role")
        hasrole = await accessControlInstance.HasRole(MINTER_ROLE, userOne)
        assert.equal(hasrole, false, "user has unexpect role")
        hasrole = await accessControlInstance.HasRole(TESTER_ROLE, userOne)
        assert.equal(hasrole, true, "user does not have expect role")
    });

});
