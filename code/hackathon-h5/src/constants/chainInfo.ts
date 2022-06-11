import MetaForestABI from '@/abi/MetaForest.json';
import TokenABI from '@/abi/MetaForestToken.json';
interface ChainInfo {
  chainId: string;
  rpc: string;
  nftGameContractAddress: string;
  nftAbi: any;
  tokenAbi: any;
  nftContractAddress: string;
  carbonEnergyAddress: string;
  carbonEmissionAddress: string;
  blockExplorerUrls: string;
  symbol: string;
  chainName: string;
  decimals: number;
}
const localChainInfo = {
  // rpc: 'https://matic-testnet-archive-rpc.bwarelabs.com',
  // chainId: '0x13881',
  // chainName: 'Matic',
  // symbol: 'Matic',
  // blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  // decimals: 18,
  // nftGameContractAddress: '0xd5213484bEdD3932E7a909bF2B847F75514Bb9D7',
  // nftContractAddress: '0x4740a48b87EEC8Df8E6925877cE6596dC5E5c88e',
  // carbonEnergyAddress: '0x6b0b893364EBda285C1406611a2aF130B0707a12',
  // carbonEmissionAddress: '0x75caB86e98106131D30c982b9b70b74241c31199',
  rpc: 'https://godwoken-testnet-v1.ckbapp.dev',
  chainId: '0x116e9',
  chainName: 'GodWoden',
  symbol: 'CKB',
  blockExplorerUrls: ['https://gw-explorer.nervosdao.community/'],
  decimals: 18,
  nftGameContractAddress: '0xc7eE8a8379bD2250692d6FA0994fe67Aa9702736',
  nftContractAddress: '0xE298Acf9EC24283D359505182Ec6F323b6B68e37',
  carbonEnergyAddress: '0xEAc9FE29C9bfbc9B5ac17c72ae3319aA08Af4d30',
  carbonEmissionAddress: '0x3250882f7D2C557cbd964405924B9a3C0fC57A9D',
  nftAbi: MetaForestABI,
  tokenAbi: TokenABI,
};

const prodChainInfo = {
  rpc: 'https://godwoken-testnet-v1.ckbapp.dev',
  chainId: '0x116e9',
  chainName: 'GodWoden',
  symbol: 'CKB',
  blockExplorerUrls: ['https://gw-explorer.nervosdao.community/'],
  decimals: 18,
  nftGameContractAddress: '0xc7eE8a8379bD2250692d6FA0994fe67Aa9702736',
  nftContractAddress: '0xE298Acf9EC24283D359505182Ec6F323b6B68e37',
  carbonEnergyAddress: '0xEAc9FE29C9bfbc9B5ac17c72ae3319aA08Af4d30',
  carbonEmissionAddress: '0x3250882f7D2C557cbd964405924B9a3C0fC57A9D',
  nftAbi: MetaForestABI,
  tokenAbi: TokenABI,
};
interface ChainInfoMap {
  [arg: string]: ChainInfo;
}
const chainInfoMap: ChainInfoMap = {
  local: localChainInfo,
  prod: prodChainInfo,
};

const chainInfo: ChainInfo = chainInfoMap[process.env.MetaForestEnv as string];
export default chainInfo;
