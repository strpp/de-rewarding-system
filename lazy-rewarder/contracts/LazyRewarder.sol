// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Tokens.sol";
import "./Reputation.sol";
import "../node_modules/@openzeppelin/contracts/access/AccessControl.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract LazyRewarder{

    //uint256 dailyInterestRate = SafeMath.div(1, 10);
    uint256 dailyInterestRate = 700;


    /// @notice stores how much interest in form of Community Token users are accumulating
    mapping(address=>uint256) public SWCTVault;
    /// @notice keeps track of last time the interests have been computed for each wallet
    mapping(address=>uint256) private addressToLastInterestComputation;

    ///@notice get vault value
    function getVault() public view returns(uint256){
        return SWCTVault[msg.sender];
    }

    /// @notice  Compute interest 
    /// formula: CT = R * r * t 
    /// where R is reputation, r is the interest rate and t the amount of time from the last computation
    function computeInterest(uint256 balance, address a) internal view returns(uint256){
        uint256 duration = SafeMath.sub(block.timestamp,addressToLastInterestComputation[a]);
        uint256 durationInDays = SafeMath.div( SafeMath.div (SafeMath.div(duration, 60), 60), 24);
        uint256 compoundInterest = SafeMath.div( SafeMath.mul(durationInDays, balance), dailyInterestRate);
        return compoundInterest;
    }

    /// @notice  Add reputation points to a user's wallet
    function addRPsToAccount(address reputation, address user, uint256 amount) public {
        Reputation r  = Reputation(reputation);
        uint256 balance = r.balanceOf(user);
        uint256 interest = computeInterest(balance, user);
        if(interest>0){
            uint256 newVaultValue = SafeMath.add(SWCTVault[user], interest);
            SWCTVault[user] = newVaultValue;
        }
        r.mint(user, amount);
        addressToLastInterestComputation[user] = block.timestamp;
    }

    /// @notice  Burn reputation points from a user's wallet
    function burnRPsToAccount(address reputation, address user, uint256 amount) public {
        Reputation r  = Reputation(reputation);
        uint256 balance = r.balanceOf(user);
        uint256 interest = computeInterest(balance, user);
        if(interest>0){
            uint256 newVaultValue = SafeMath.add(SWCTVault[user], interest);
            SWCTVault[user] = newVaultValue;
        }
        r.burn(user, amount);
        addressToLastInterestComputation[user] = block.timestamp;
    }

    /// @notice  converts interests into Community Token
    function redeem(address tokens) public{
        uint256 amount = SWCTVault[msg.sender];
        require(amount>0);
        SWCTVault[msg.sender] = 0;
        Tokens t = Tokens(tokens);
        t.mint(msg.sender, amount);
    }
}