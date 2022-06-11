## 1 Initialization

### 1.1 Installation
```
$ npm install 
```
or
```
$ yarn
```
install all packages we need.


### 1.2 Set env && secret
.env file will be read to set env like this:
```
NFT_NAME="MetaForest"
NFT_SYMBOL="MFT"
NFT_BASE_URL="https://meta-forest.com/"
MAX_NFT_CAN_BUY=8000
PRICE=300000000000000
ADMIN_USER="0x85FCaa731b57f27C03E631592DCc697F4917c358"
```
.secret file will be read to set accounts.

### 1.3 Compile
```
truffle compile --all
```
compile all contracts in contract folder.

### 1.4 Migration
```
truffle migrate
```
the command line will deploy you contract according to your script file in migrations.

### 1.5 Test
```
truffle test ./test/***.js
```
In the test file directory, you can write javascript scripts to suit your needs. You can run the script file to check the functionality.


### 1.6 Network Config
in truffle.config.js, you can find networks. If you want to add new network, just like this:
```
localhost: {
    network_id: "*",       // Any network (default: none)
    provider: () => new HDWalletProvider(privateKeys, `http://localhost:8545`),
}
```
notice, PrivateKeys are read from the.secret file.So you need to write some private keys in .secret file.Don't worry, this file will not be leaked, and no one will get your account private key.


## 2 Contract introduction
### 2.1 Architecture
![](https://gitlab.fuxi.netease.com:8081/innovative-business/meta-forest/meta-forest-eth-shanghai-hackathon/-/blob/master/metaforest_uml.png)

### 2.2 Overview
本项目是一个由5个合约组成的二进制智能合约系统，包括基础合约：AccessControl, CarbonEnergy, Tree，MetaForestCore，CarbonEmissoin；<br>

#### 2.2.1 CarbonEmission
统计Tree NFT所有者（可以是用户账户，也可以是合约账户）在链上交易产生的碳排放量;<br>

#### 2.2.2 MetaForestCore
定义了减碳游戏的核心逻辑，包括免费种树、捐款买树、浇水、升级、治疗、步行、偷能量、毒气攻击等玩法；<br>

#### 2.2.3 AccessControl
实现基于角色的灵活权限许可方案，管理所有合约的权限，保障合约的安全访问。未来合约的治理权限都会交给社区和零碳联盟代表；<br>

#### 2.2.4 CarbonEnergy
是一个标准的ERC20代币合约，CarbonEnergyToken（CET）可以在用户间自由流通；<br>

#### 2.2.5 Tree
是一个符合ERC721标准的可变NFT合约，在不同的不健康值和成长值下会返回不同的元数据URL；<br>

### 2.3 Metadata
我们将树NFT的元数据存储在IPFS上，CID索引如下：<br>

|  | Normal tree image | Legend tree image |
| ------ | ------ | ------ |
| withered image | https://nftstorage.link/ipfs/bafybeibrwnkaqxylksukwzrp43nkgwnddrymg27mzupexmoabsleguntr4 | https://nftstorage.link/ipfs/bafybeifs7hnzyyewwpqjgpu3gc5fcjjhp4tespxn5p67ih6ssykym74dcm |  
| small image | https://nftstorage.link/ipfs/bafybeialckszfbjgtwopfuzg4e6qukf57ndfyzlmlie7jh2gwwfeermbom | https://nftstorage.link/ipfs/bafybeihxcuasaw4jkozueyhod3sjcgb6tlkpwrqh3dlinccj7hyjup7esy |  
| medium image| https://nftstorage.link/ipfs/bafybeidymghhl5p3wzoiv26actkxuqfrxieysvsujmvad7cp7rmhzcjy5u | https://nftstorage.link/ipfs/bafybeiaykeh7tkmvawgoldnkuxycyjddjirtylylj3jzmaiwwxc2qi62w4 |  
| large image | https://nftstorage.link/ipfs/bafybeihoawtbisrwkrcdhkwoohmp3nmzrnzpgcytogypjphejnkb7a5coy | https://nftstorage.link/ipfs/bafybeib6ssjs3tettpna6ljoftynbapzexestd3tx5xgutcsg32epvu6dy |


|  | Legend tree json | Legend tree json |
| ------ | ------ | ------ |
| json | https://nftstorage.link/ipfs/bafkreidooudzwnbek32dhuojiilarq774bttgq5qrses7ksy3qpd3hgn4q| https://nftstorage.link/ipfs/bafkreigjmut7vpjl7ofyvmaaudew5a55lyk6duztgys5kp2b7ghqh677dy|  

## 3 Main functions introduction
外部调用将主要调用外围接口。外部可用功能都可以在Main functions中查看。内部函数可在 Meta Forest Github 存储库中查看。本章节介绍各个合约的主要接口。<br>

#### 3.1 CarbonEmission
#### 1、 function increaseCarbonEmissions(address user, uint256 amount) public onlyAdmin(msg.sender)<br>
功能：给指定账户增加碳排放，每隔6600个区块，最多只能增加1次碳排放，该接口是给预言机使用，碳排放认证联盟成员每天定时对各个账户交易产生的碳排放达成共识后，通过预言机上传到协议中<br>
限制：该接口需要admin权限<br>  
##### 2、function totalBalanceOf(address account) public view  returns (uint256)<br>   
功能：获取用户总的碳排放<br>  
##### 3、function lastBalanceOf(address account) public view  returns (uint256)<br>
功能：获取用户昨天的碳排放。如果近6600个块高没有增加碳排放，将返回0<br>  
##### 4、function lastUpdateOf(address account) public view  returns (uint256)<br>
功能：获取最近一次更新碳排放的块高<br>

#### 3.2 AccessControl
##### 1、function removeRoleUser(string[] calldata modifierRoles, address[] calldata RoleUsers) external onlyRole(_roles["ADMIN_USER"]<br>
功能:批量删除角色许可权限<br>
限制：该接口需要admin权限<br>
##### 2、function addRoleUser(string[] calldata modifierRoles, address[] calldata newRoleUsers) external onlyRole(_roles["ADMIN_USER"])<br>
功能:批量添加角色许可权限<br>
限制:该接口需要admin权限<br>

#### 3.3 CarbonEnergy
 ##### 1、function mint(address account, uint256 amount) external onlyAdmin(msg.sender)<br>
 功能：给指定用户mint指定数量的CET，游戏中用户步行和捐购tree可以获得CET<br>
 限制：该接口需要admin权限<br>
 ##### 2、function burn(address account, uint256 amount) public<br>
 功能：销毁指定用户指定数量的CET,用于游戏中的浇水玩法<br>
 限制：需要该用户将CET授权给操作者<br>

#### 3.4 Tree
##### 1、function tokenURI(uint256 tokenId) public view virtual override validTokenId(tokenId) returns (string memory)<br>

功能：查询指定token的URI<br>
##### 2、function tokenListOfOwner(address user, uint256 queryIndex) external view returns (uint256[] memory, bool)<br>

功能：查询指定用户所有的token，当token数量大于10个时，会以分页的形式返回<br>
##### 3、function mint(address to, uint256 tokenId) external onlyAdminOrMaster(msg.sender) onlyValidAddress(to)<br>

功能：给指定用户mint特定的token<br>
限制：该接口需要admin或者master权限<br>

#### 3.5 MetaForestCore
##### 1、function buy(uint16 count) external payable<br>
 功能：购买尊贵的TREE-NFT<br>
 限制：需要支付的代币value = count*price;当代币小于count*price时，会购买失败<br>
##### 2、function setPrice(uint80 price) external onlyAdmin<br>
 功能：设置尊贵TREE-NFT的价格, 该接口是给Meta Forest DAO使用<br>
 限制：该接口需要admin权限<br>
##### 3、function getFreeNFT() external onlyOnce<br>
 功能：领取一个免费的NFT<br>
 限制：一个账户限制一次<br>
##### 4、function takeOutNativeToken(address payable to, uint256 amount) external onlyOwner(msg.sender)<br>
 功能：将合约中收集的MATIC提现给某个账户，该接口是给Meta Forest DAO使用，捐款给社区认可的减碳项目<br>
 限制：需要项目owner权限<br>
##### 5、function watering(uint256 tokenId, uint256 wateringAmount) external<br>
 功能：用户销毁自己的碳能量CET给指定的树浇水，提高树的成长值或则让树恢复健康<br>
 限制：需要用户提前将自己的CET 授权给MetaForestCore合约<br>
##### 6、function attack(address account, uint256 tokenId, uint256 amount) external<br>
功能：用户产生碳排放时，其他用户可以在指定时间(6600块高)内将用户的碳排放转移到用户的树上，使树生病；超出指定时间(6600块高)，该毒气弹将失效，无法被点燃<br>

##### 7、function getGrowthAmount(uint256 tokenId) external view returns (uint256)<br>
 功能：查询指定树的成长值<br>
##### 8、function getUnhealthyAmount(uint256 tokenId) external view returns (uint256)<br>
 功能：查询指定树的不健康值<br>
##### 9、function getAttackAmount(address account) external view returns (uint256)<br>
 功能：查询指定用户指定时间(6600块高)内的碳排放，可用于攻击该用户的树<br>
