# Introduction

### Main functions:

- 服务端每天定时统计TREE NFT所有者账户的碳排放量，碳排放量的标准为：账户碳排放量 = 账户消耗的gas/整个网络消耗的gas * 整个网络消耗的电力* 一度电排放的二氧化碳，目前该数据为MOCK;
- 服务端操作admin账户，将每个账户的碳排放量写到CarbonEmission合约种；
- 服务端统计玩家的步行公里数，根据VSC标准计算减碳量;
- 服务端操作CabonEnergy合约的admin账户，根据用户的减碳量铸造等量CET转到玩家账户；

### TODO

- 使用SIWE(Sign-In with Ethereum)认证逻辑 
- 接口安全保护，比如重放攻击
- 更多

### 环境

Nodejs > 14

If use **Node.js >= 16.10 **
then use **yarn**
otherwise use **npm**

### Config

`.env` file

- `PRIVATE_KEY`: The real implementation is an automated private key escrow service providing private keys
- `JSON_RPC`: test chain http rpc for this event
- `ENERGY_ADDRESS`: carbon credit contract address
- `EMISSION_ADDRESS`: carbon emission contract address

### 初始化

```
yarn install // install dependencies
```

or

```
npm install
```

#### run

```
yarn start // http://localhost:3000
```

or

```
npm run start
```
