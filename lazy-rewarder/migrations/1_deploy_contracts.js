const LazyRewarder = artifacts.require("LazyRewarder");
const Reputation = artifacts.require("Reputation");
const Tokens = artifacts.require("Tokens");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(LazyRewarder);
    await deployer.deploy(Reputation, LazyRewarder.address);
    await deployer.deploy(Tokens, LazyRewarder.address);
  });
};