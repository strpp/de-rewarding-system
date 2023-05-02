const AirdropRewarder = artifacts.require("AirdropRewarder");
const RedeemAirdropRewarder = artifacts.require("RedeemAirdropRewarder");
const Reputation = artifacts.require("Reputation");
const Tokens = artifacts.require("Tokens");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(AirdropRewarder);
    await deployer.deploy(RedeemAirdropRewarder);
    await deployer.deploy(Reputation, AirdropRewarder.address);
    await deployer.deploy(Tokens, AirdropRewarder.address);
  });
};