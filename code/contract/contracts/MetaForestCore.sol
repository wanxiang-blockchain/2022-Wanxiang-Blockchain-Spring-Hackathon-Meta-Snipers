pragma solidity ^0.8.4;

// SPDX-License-Identifier: MIT OR Apache-2.0
import "./MetaForestAccessControl.sol";
import "./MetaForestTree.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./MetaForestCarbonEnergy.sol";
import "./MetaForestCarbonEmission.sol";

contract MetaForestCore is Initializable {

    // map
    mapping(address => bool) private _freeList;
    mapping(uint256 => uint256) private _growth;
    mapping(uint256 => uint256) private _unhealthy;
    mapping(address => uint256) private _lastAttack;

    // number
    uint256 private _maxNFTCanBuy;
    uint256 private _NFTHasSale;
    uint256 private _NFTHasCollected;

    // price
    uint80 private _price;

    // external contracts.
    metaForestAccess private _access;
    MetaForestTree private _tree;
    MetaForestCarbonEnergy private _carbonEnergy;
    MetaForestCarbonEmission private _carbonEmission;

    event Attack(address indexed account, uint256 indexed tokenId, uint256 amount);
    event Watering(address indexed account,uint256 indexed tokenId, uint256 wateringAmount);

    modifier onlyOwner() {
        require(_access.isOwner(msg.sender) == true, "msg's sender is not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(_access.HasRole(_access.ADMIN_ROLE(), msg.sender) == true, "msg's sender is not the admin");
        _;
    }

    modifier onlyOnce() {
        require(!_freeList[msg.sender], "msg'sender has collected");
        _;
    }

    function initialize(address access, address tree, address carbonEnergy, address carbonEmission, uint256 maxNFTCanBuy) public initializer {
        _access = metaForestAccess(access);
        _tree = MetaForestTree(tree);
        _carbonEnergy = MetaForestCarbonEnergy(carbonEnergy);
        _carbonEmission = MetaForestCarbonEmission(carbonEmission);
        _maxNFTCanBuy = maxNFTCanBuy;
        _NFTHasCollected = maxNFTCanBuy + 1;
    }

    // update access contract address by owner.
    function updateAccess(address access) external onlyOwner {
        _access = metaForestAccess(access);
    }

    // update nft contract address by owner.
    function updateTree(address tree) external onlyOwner {
        _tree = MetaForestTree(tree);
    }

    // set price by admin.
    function setPrice(uint80 price) external onlyAdmin {
        _price = price;
    }

    function getPrice() external view returns (uint80) {
        return _price;
    }

    function getNFTHasSale() external view returns (uint256) {
        return _NFTHasSale;
    }

    function getNFTHasCollected() external view returns (uint256) {
        return _NFTHasCollected;
    }

    // purchase NFT.
    /**
     * @dev buy
     * Requirements:
     *
     * - `count` the number of tree you want to buy.
    */
    function buy(uint16 count) external payable {
        require(count >= 1, "the quantity purchased must be greater than zero");
        require(msg.value >= _price * count, "insufficient payment");
        require(_NFTHasSale + count <= _maxNFTCanBuy, "insufficient balance of nft that can buy");
        _safeMintByCount(msg.sender, count);
    }

    function _safeMintByCount(address to, uint16 count) internal {
        uint16 index = 0;
        do {
            _tree.mint(to, _NFTHasSale++);
            index++;
        }while(index < count);
    }

    // get free nft only once.
    /**
     * @dev getFreeNFT
    */
    function getFreeNFT() external onlyOnce {
        _freeList[msg.sender] = true;
        _tree.mint(msg.sender, _NFTHasCollected++);
    }

    // withdraw funds.
    /**
     * @dev takeOutNativeToken
     * Requirements:
     *
     * - `to` receipt address.
     * - `amount` funds that you wand to withdraw.
    */
    function takeOutNativeToken(address payable to, uint256 amount) external onlyOwner {
        require(amount > 0, "the amount of funds withdrawn should greater than zero");
        require(address(this).balance >= amount, "the amount of funds withdrawn must be less than the balance of contract");

        to.transfer(amount);
    }


    // watering
    /**
     * @dev watering
     * Requirements:
     *
     * - `tokenId` token id of watering.
     * - `wateringAmount` the number of energy you want to use.
    */
    function watering(address account, uint256 tokenId, uint256 wateringAmount) external onlyAdmin {
        uint256 energyBalance = _carbonEnergy.balanceOf(account);
        require(wateringAmount <= energyBalance, "insufficient carbo energy");

        _carbonEnergy.burn(account, wateringAmount);
        if(_unhealthy[tokenId] >= wateringAmount) {
            _unhealthy[tokenId] = _unhealthy[tokenId] - wateringAmount;
        }else{ 
            _growth[tokenId] += wateringAmount - _unhealthy[tokenId];
            _unhealthy[tokenId] = 0;
        }
        emit Watering(account,tokenId,wateringAmount);
    }


    // attack
    /**
     * @dev attack
     * Requirements:
     *
     * - `account` address you want to attack .
     * _ `tokenId` token you want to attack and token's owner is account.
     * - `amount` the number of gas bombs you want to use.
    */
    function attack(address account, uint256 tokenId, uint256 amount) external {
        uint256 lastEmissionBalance = _carbonEmission.lastBalanceOf(account);
        require(account == _tree.ownerOf(tokenId),"account not the token owner");
        require(_lastAttack[account] < _carbonEmission.lastUpdateOf(account),"has attacked");
        require(amount <= lastEmissionBalance, "insufficient carbo emission");

        _unhealthy[tokenId] = _unhealthy[tokenId] + amount;
        _lastAttack[account] = block.number;
        emit Attack( account, tokenId, amount);
    }

    // get growthAmount.
    function getGrowthAmount(uint256 tokenId) external view returns (uint256) {
        return _growth[tokenId];
    }

    // get attackAmount.
    function getAttackAmount(address account) external view returns (uint256) {
        if(_lastAttack[account] >= _carbonEmission.lastUpdateOf(account)) {
            return 0;
        }
        return _carbonEmission.lastBalanceOf(account);
    }

    // get UnhealthyAmount.
    function getUnhealthyAmount(uint256 tokenId) external view returns (uint256) {
        return _unhealthy[tokenId];
    }
}