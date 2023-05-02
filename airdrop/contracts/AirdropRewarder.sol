// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Tokens.sol";
import "./Reputation.sol";
import "../node_modules/@openzeppelin/contracts/access/AccessControl.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AirdropRewarder {
   
    uint256 supply = 100;
    address[] subscribedWallets;

    /// @notice  Add reputation points to a user's wallet
    function addRPsToAccount(address reputation, address user, uint256 amount) public {
        Reputation r  = Reputation(reputation);
        r.mint(user, amount);
    }

    /// @notice  Burn reputation points from a user's wallet
    function burnRPsToAccount(address reputation, address user, uint256 amount) public {
        Reputation r  = Reputation(reputation);
        r.burn(user, amount);
    }

    /// @notice subscription mechanism is needed to count how much users are interested in the airdrop
    /// Indeed, from ERC-20 is not possible to keep count of users because _balances is a mapping and hence it has no length property.
    /// Subscription could be the easiest way to overcome this issue
    function subscribeToAirdrop() public{
        for(uint i=0; i<0; i++){
            require(subscribedWallets[i] != msg.sender);
        }
        subscribedWallets.push(msg.sender);
    }

    function getSubscribed() public view returns(address[] memory){
        return subscribedWallets;
    }


    /// @notice distributed tokens among users every four weeks
    /// PROPORTIONAL DISTRIBUTION
    /// the formula is
    /// User RPs : totalRP = CT_to_mint_for_user (i.e. amount) : monthlySupply
    function airdrop(address reputation, address token) public {
        //TODO: timeblock
        Reputation r = Reputation(reputation);
        Tokens t = Tokens(token);
        uint256 totalSupply = r.totalSupply();
        for(uint i=0; i<subscribedWallets.length; i++){
            uint256 userRPs = r.balanceOf(subscribedWallets[i]);
            uint256 amount = SafeMath.div(SafeMath.mul(userRPs, supply), totalSupply);
            t.mint(subscribedWallets[i], amount);
        }
    }
}