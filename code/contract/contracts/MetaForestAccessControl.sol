pragma solidity ^0.8.4;

// SPDX-License-Identifier: MIT OR Apache-2.0


import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract metaForestAccess is AccessControlUpgradeable {
    uint8 public constant ADMIN_ROLE  = 1;
    uint8 public constant MASTER_ROLE = 2;
    address private _owner;
    // roles.
    mapping(uint8 => bytes32) private _access_roles;

    modifier onlyOwner{
        require(msg.sender == _owner, "msg's sender is not the owner");
        _;
    }

    function initialize() public initializer {
        _owner = msg.sender;
        _access_roles[ADMIN_ROLE] = keccak256(abi.encodePacked(ADMIN_ROLE));
        _grantRole(_access_roles[ADMIN_ROLE], msg.sender);
    }

    function isOwner(address account) external view returns (bool) {
        return account == _owner;
    }

    function HasRole(uint8 role, address account) external view returns (bool) {
        return hasRole(_access_roles[role], account);
    }

    // update owner and set admin role.
    function updateOwner(address newOwner) external onlyOwner {
        _owner = newOwner;
    }

    // add role user.
    function addRoleUser(uint8[] calldata modifierRoles, address[] calldata newRoleUsers) external onlyRole(_access_roles[ADMIN_ROLE]) {
        uint256 length = modifierRoles.length;
        require(length == newRoleUsers.length, "array length mismatch");
        require(length >= 1, "array's length can not be zero");
        for (uint256 index = 0; index < length; index++) {
            if (_access_roles[modifierRoles[index]] == bytes32(0)) {
                _access_roles[modifierRoles[index]] = keccak256(abi.encodePacked(modifierRoles[index]));
                _setRoleAdmin(_access_roles[modifierRoles[index]], _access_roles[ADMIN_ROLE]);
            }
            _grantRole(_access_roles[modifierRoles[index]], newRoleUsers[index]);
        }
    }

    // remove role user.
    function removeRoleUser(uint8[] calldata modifierRoles, address[] calldata RoleUsers) external onlyRole(_access_roles[ADMIN_ROLE]) {
        uint256 length = modifierRoles.length;
        require(length == RoleUsers.length, "array length mismatch");
        require(length >= 1, "array's length can not be zero");
        for (uint256 index = 0; index < length; index++) {
            require((_access_roles[modifierRoles[index]] != bytes32(0)), "some role not exist");
            _revokeRole(_access_roles[modifierRoles[index]], RoleUsers[index]);
        }
    }
}