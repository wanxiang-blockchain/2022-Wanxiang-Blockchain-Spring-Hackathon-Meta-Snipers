
const AccessControl = artifacts.require("metaForestAccess");
const MetaForestTree = artifacts.require("MetaForestTree");
const MetaForestCarbonEmission = artifacts.require("MetaForestCarbonEmission");
const MetaForestCarbonEnergy = artifacts.require("MetaForestCarbonEnergy");
const MetaForestCore = artifacts.require("MetaForestCore");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const web3 = require('web3');
const BN = web3.utils.BN;


const MASTER_ROLE = 2;
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
    const tenNFTCost = new BN(3000000000000000);
    const maxNFTCanBuy = new BN(8000);

    const countTen = 10;
    const queryIndex = new BN(0);
    const userOneQueryStartIndex = new BN(10);
    const userOneQueryStartIndexFromLastIndex = new BN(19);
    const userOneQueryStartFromLengthIndex = new BN(20);
    const userOneQueryStartIndexOutOfLength = new BN(100);

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

    it("purchase 10 NFT by userOne", async function() {
        await metaForestCoreInstance.buy(countTen, { from: userOne, value: tenNFTCost });
        let balance = await metaForestTreeInstance.balanceOf(userOne);
        assert.equal(balance.toNumber(), 10, "balance error");
    });

    it("purchase 10 NFT by userTwo", async function() {
        await metaForestCoreInstance.buy(countTen, { from: userTwo, value: tenNFTCost });
        let balance = await metaForestTreeInstance.balanceOf(userTwo);
        assert.equal(balance.toNumber(), 10, "balance error");
    });

    it("purchase 10 NFT by userOne", async function() {
        await metaForestCoreInstance.buy(countTen, { from: userOne, value: tenNFTCost });
        let balance = await metaForestTreeInstance.balanceOf(userOne);
        assert.equal(balance.toNumber(), 20, "balance error");
    });

    it("get token list of userOne", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userOne, queryIndex);
        assert.equal(result[0].length, 10, "length of result error");
        assert.equal(result[1], true, "boolean value error");
        assert.equal(result[0][1].toNumber(), 1, "the value of index error");
    });

    it("get token list of userOne from intermediate index", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userOne, userOneQueryStartIndex);
        assert.equal(result[0].length, 10, "length of result error");
        assert.equal(result[1], false, "boolean value error");
        assert.equal(result[0][2].toNumber(), 22, "the value of index error");
    });

    it("get token list of userOne from last index", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userOne, userOneQueryStartIndexFromLastIndex);
        assert.equal(result[0].length, 1, "length of result error");
        assert.equal(result[1], false, "boolean value error");
        assert.equal(result[0][0].toNumber(), 29, "the value of index error");
    });

    it("get token list of userOne from length index", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userOne, userOneQueryStartFromLengthIndex);
        assert.equal(result[0].length, 0, "length of result error");
    });

    it("get token list of userOne start from out of length", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userOne, userOneQueryStartIndexOutOfLength);
        assert.equal(result[0].length, 0, "length of result error");
    });

    it("get token list of userTwo", async function() {
        let result = await metaForestTreeInstance.tokenListOfOwner(userTwo, queryIndex);
        assert.equal(result[0].length, 10, "length of result error");
        assert.equal(result[1], false, "boolean value error");
        assert.equal(result[0][2].toNumber(), 12, "the value of index error");
    });
});
