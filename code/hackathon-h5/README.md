# Environment
Nodejs > 12

# Configuration

(1) Chain info configuration

File location /src/constants/chainInfo.ts

Local Development
```js
const localChainInfo = {
  rpc: 'https://matic-testnet-archive-rpc.bwarelabs.com',
  chainId: '0x13881',
  chainName: 'Matic',
  symbol: 'Matic',
  blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  decimals: 18,
  //change the contract address if they are changed!!!
  nftGameContractAddress: '0xd5213484bEdD3932E7a909bF2B847F75514Bb9D7',
  nftContractAddress: '0x4740a48b87EEC8Df8E6925877cE6596dC5E5c88e',
  carbonEnergyAddress: '0x6b0b893364EBda285C1406611a2aF130B0707a12',
  carbonEmissionAddress: '0x75caB86e98106131D30c982b9b70b74241c31199',
  nftAbi: MetaForestABI,
  tokenAbi: TokenABI,
};
```

Online Deployment
```js
const prodChainInfo = {
  rpc: 'https://matic-testnet-archive-rpc.bwarelabs.com',
  chainId: '0x13881',
  chainName: 'Matic',
  symbol: 'Matic',
  blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  decimals: 18,
  //change the contract address if they are changed!!!
  nftGameContractAddress: '0xd5213484bEdD3932E7a909bF2B847F75514Bb9D7',
  nftContractAddress: '0x4740a48b87EEC8Df8E6925877cE6596dC5E5c88e',
  carbonEnergyAddress: '0x6b0b893364EBda285C1406611a2aF130B0707a12',
  carbonEmissionAddress: '0x75caB86e98106131D30c982b9b70b74241c31199',
  nftAbi: MetaForestABI,
  tokenAbi: TokenABI,
};
```

(2) Proxy Settings

Local Development:

File location /config/proxy.ts

```js

'/api': {
  //change the target if needed
    target: 'http://10.221.32.178:3000',
    changeOrigin: true,
  },

```

Online Deployment:

modify the nginx conf.


# Start

## initialization

yarn install // install dependencies
or
npm install

## local run

yarn local // http://localhost:8001
or
npm run local

## build

npm run build:prod


