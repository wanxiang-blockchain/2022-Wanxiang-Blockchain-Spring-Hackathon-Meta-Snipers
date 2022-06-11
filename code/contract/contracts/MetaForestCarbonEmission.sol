// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./MetaForestAccessControl.sol";

contract MetaForestCarbonEmission is Initializable {

    metaForestAccess private _access;
    mapping(address => uint256) private _totalEmission;
    mapping(address => uint256) private _lastEmission;
    mapping(address => uint256) private _lastUpdate;
    uint256 private _blockNumOfOneDay;

    event Increase(address indexed user, uint256 amount);

    function initialize(address access, uint256 blockNumOfOneDay) public initializer {
        _access = metaForestAccess(access);
        _blockNumOfOneDay = blockNumOfOneDay;
    }

    modifier onlyAdmin() {
        require(_access.HasRole(_access.ADMIN_ROLE(), msg.sender) == true, "msg's sender is not the admin");
        _;
    }


    function increaseCarbonEmissions(address user, uint256 amount) public onlyAdmin {
       require(block.number - _lastUpdate[user] > _blockNumOfOneDay, "can't increase in limit time");
        _lastUpdate[user] = block.number;
        _lastEmission[user] = amount;
        _totalEmission[user] = _totalEmission[user] + amount;
        emit Increase(user,amount);
    }


    function lastBalanceOf(address account) public view  returns (uint256) {
        if(block.number - _lastUpdate[account] > _blockNumOfOneDay){
            return 0;
        }
        return _lastEmission[account];
    }


    function lastUpdateOf(address account) public view  returns (uint256) {
        return _lastUpdate[account];
    }

    function totalBalanceOf(address account) public view  returns (uint256) {
        return _totalEmission[account];
    }
}