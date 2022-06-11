// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./MetaForestAccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MetaForestCarbonEnergy is ERC20Upgradeable {
    metaForestAccess private _access;


    function initialize(address access) public initializer {
        __ERC20_init("CarbonEnergyToken","CET");
        _access = metaForestAccess(access);
    }
    
    modifier onlyAdmin() {
        require(_access.HasRole(_access.ADMIN_ROLE(), msg.sender) == true, "msg's sender is not the admin");
        _;
    }


    function mint(address account, uint256 amount) external onlyAdmin{
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        address spender = _msgSender();
        _spendAllowance(account, spender, amount);
        _burn(account,amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}