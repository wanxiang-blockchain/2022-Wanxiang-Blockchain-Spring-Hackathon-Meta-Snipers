
// async function main() {
//     const ADMIN_ROLE = 1;
//     const MASTER_ROLE = 2;
// 	const adminUser1 = "0x37d5d3f2e99552ea92d79456dc391334bbc96b52";
// 	const adminUser2 = "0xE6AC66A62780fdFa34087683b732cDa4F4F41EB6";
//     const [deployer] = await ethers.getSigners();
  
//     console.log("Deploying contracts with the account:", deployer.address);
  
//     console.log("Account balance:", (await deployer.getBalance()).toString());
  
//     const metaForestAccess = await ethers.getContractFactory("metaForestAccess");
//     const accessControl = await metaForestAccess.deploy();
// 	const accessControlInstance = await accessControl.deployed();
//     await accessControlInstance.initialize();
//     console.log("AccessControl:", accessControlInstance.address);

//     const MetaForestTree = await ethers.getContractFactory("MetaForestTree");
//     const metaForestTree = await MetaForestTree.deploy();
//     const treeInstance = await metaForestTree.deployed();
// 	await treeInstance.initialize("metaForestTree","metaTreeNft","http://",accessControlInstance.address);
// 	console.log("treeInstance:", treeInstance.address);


//     const MetaForestCarbonEnergy = await ethers.getContractFactory("MetaForestCarbonEnergy");
//     const metaForestCarbonEnergy = await MetaForestCarbonEnergy.deploy();
//     const carbonEnergyInstance = await metaForestCarbonEnergy.deployed();
// 	await carbonEnergyInstance.initialize(accessControlInstance.address);
// 	console.log("carbonEnergyInstance:", carbonEnergyInstance.address);

//     const MetaForestCarbonEmission = await ethers.getContractFactory("MetaForestCarbonEmission");
//     const metaForestCarbonEmission = await MetaForestCarbonEmission.deploy();
//     const carbonEmissionInstance = await metaForestCarbonEmission.deployed();
// 	await carbonEmissionInstance.initialize(accessControlInstance.address,6000);
// 	console.log("carbonEmissionInstance:", carbonEmissionInstance.address);

//     const MetaForestCore = await ethers.getContractFactory("MetaForestCore");
//     const metaForestCore = await MetaForestCore.deploy();
//     const coreInstance = await metaForestCore.deployed();
// 	await coreInstance.initialize(coreInstance.address,treeInstance.address,carbonEnergyInstance.address,carbonEmissionInstance.address,15);
// 	console.log("coreInstance:", coreInstance.address);

//     await accessControlInstance.addRoleUser([MASTER_ROLE], [coreInstance.address]);
//     await accessControlInstance.addRoleUser([ADMIN_ROLE], [adminUser1]);
// 	await accessControlInstance.addRoleUser([ADMIN_ROLE], [deployer.address]);
//     console.log("set access");
//     // set price.
//     await coreInstance.setPrice(300);
  
//   }
  
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });
  