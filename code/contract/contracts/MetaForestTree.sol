pragma solidity ^0.8.4;

// SPDX-License-Identifier: MIT OR Apache-2.0

import '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';
import "./MetaForestAccessControl.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MetaForestTree is ERC721EnumerableUpgradeable{
    using StringsUpgradeable for uint256;

    // private data.
    // string private _baseUrl;
    metaForestAccess private _access;

    // url.
    string private _normalBaseUrl;
    string private _legendBaseUrl;

    uint256 private _maxNFTCanBuy;

    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId) == true, "token id is not exits");
        _;
    }

    modifier onlyValidAddress(address to) {
        require(to != address(0), "receipt is zero address");
        _;
    }

    modifier onlyOwner() {
        require(_access.isOwner(msg.sender) == true, "msg's sender is not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(_access.HasRole(_access.ADMIN_ROLE(), msg.sender) == true, "msg's sender is not the admin");
        _;
    }

    modifier onlyAdminOrMaster() {
        require(_access.HasRole(_access.ADMIN_ROLE(), msg.sender) || _access.HasRole(_access.MASTER_ROLE(), msg.sender), "msg's sender is not the admin or master");
        _;
    }

    function initialize(string memory name, string memory symbol, string memory normalBaseUrl, string memory legendBaseUrl, address access, uint256 maxNFTCanBy) public initializer {
        __ERC721_init(name, symbol);
        _access = metaForestAccess(access);
        _normalBaseUrl = normalBaseUrl;
        _legendBaseUrl = legendBaseUrl;
        _maxNFTCanBuy = maxNFTCanBy;
    }

    // update access contract address by owner.
    function updateAccess(address access) external onlyOwner() {
        _access = metaForestAccess(access);
    }

    // set BaseURL by admin.
    function setBaseUrl(string memory newNormalBaseUrl, string memory newLegendBaseUrl ) external onlyAdmin() { 
        _normalBaseUrl = newNormalBaseUrl;
        _legendBaseUrl = newLegendBaseUrl;
    }

    // get token uri.
    function tokenURI(uint256 tokenId) public view virtual override validTokenId(tokenId) returns (string memory) {
        if (tokenId <= _maxNFTCanBuy ){
            return _legendBaseUrl;
        }
        return _normalBaseUrl;
    } 

    // baseURL.
    function baseURL() external view returns (string memory, string memory) {
        return (_normalBaseUrl, _legendBaseUrl);
    }

    // get token list of owner.
    /**
     * @dev tokenListOfOwner
     * Requirements:
     *
     * - `user` the address of user that you want to query.
    */
    function tokenListOfOwner(address user, uint256 queryIndex) external view returns (uint256[] memory, bool) {
        uint256 length = balanceOf(user);
        uint256[] memory list = new uint256[](0);
        if (length == 0 || queryIndex >= length) {
            return (list, false);
        }
        uint256 index = 0;
        uint256 endIndex = queryIndex + 10;
        uint256 amount = 10;
        uint256 id = 0;
        bool    more = true;
        if ( endIndex >= length ) {
            amount = length - queryIndex;
            more = false;
        }
        list = new uint256[](amount);
        do {
            id = tokenOfOwnerByIndex(user, queryIndex++);
            list[index] = id;
            index++;
        }while(index < amount);
        return (list, more);
    }

    // mint NFT.
    function mint(address to, uint256 tokenId) external onlyAdminOrMaster onlyValidAddress(to) {
        _safeMint(to, tokenId);
    }
}
