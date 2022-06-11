

const AccessControl = artifacts.require("metaForestAccess");
const MetaForestTree = artifacts.require("MetaForestTree");
const MetaForestCarbonEmission = artifacts.require("MetaForestCarbonEmission");
const MetaForestCarbonEnergy = artifacts.require("MetaForestCarbonEnergy");
const MetaForestCore = artifacts.require("MetaForestCore");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const web3 = require('web3');
const BN = web3.utils.BN;

const ADMIN_ROLE = 1;
const MASTER_ROLE = 2;
const NFTName = process.env.NFT_NAME;
const NFTSymbol = process.env.NFT_SYMBOL;
const NormalNFTUrl = process.env.NFT_NORMAL_URL;
const LegendNFTUrl = process.env.NFT_LEGEND_URL;
const MaxNFTCanBy = process.env.MAX_NFT_CAN_BUY;
const maxNFTCanBuy = new BN(MaxNFTCanBy);
const adminUser = process.env.ADMIN_USER;
const price = new BN(process.env.PRICE);
const blockNumberOfOneDay = new BN(process.env.BLOCK_NUMBER_OF_ONE_DAY);

module.exports = async function (accounts) {
    console.log("contracts deploying....");
    const accessControlInstance = await deployProxy(AccessControl, [], { initializer: 'initialize' });

    const metaForestTreeInstance = await deployProxy(MetaForestTree, [NFTName, NFTSymbol, NormalNFTUrl, LegendNFTUrl, accessControlInstance.address, maxNFTCanBuy], { initializer: 'initialize' });

    const carbonEnergyInstance = await deployProxy(MetaForestCarbonEnergy, [accessControlInstance.address], { initializer: 'initialize' });
    const carbonEmissionInstance = await deployProxy(MetaForestCarbonEmission, [accessControlInstance.address, blockNumberOfOneDay], { initializer: 'initialize' });

    const metaForestCoreInstance = await deployProxy(MetaForestCore, [accessControlInstance.address, metaForestTreeInstance.address, carbonEnergyInstance.address, carbonEmissionInstance.address, maxNFTCanBuy], { initializer: 'initialize' });

    console.log("contracts deployed");

    // set role.
    await accessControlInstance.addRoleUser([MASTER_ROLE], [metaForestCoreInstance.address]);
    await accessControlInstance.addRoleUser([ADMIN_ROLE], [adminUser]);
    // set price.
    await metaForestCoreInstance.setPrice(price);

    console.log("metaForest accessControl address:", accessControlInstance.address);
    console.log("metaForest Tree address:", metaForestTreeInstance.address);
    console.log("metaForest CarbonEnergy address:", carbonEnergyInstance.address);
    console.log("metaForest CarbonEmission address:", carbonEmissionInstance.address);
    console.log("metaForest address:", metaForestCoreInstance.address);
};