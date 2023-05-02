const Reputation = artifacts.require("Reputation");
const Tokens = artifacts.require("Tokens");
const LazyRewarder = artifacts.require("LazyRewarder");
const { time } = require('../node_modules/@openzeppelin/test-helpers');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

contract("Performance", (accounts) => {

  let TokensContract, LazyRewarderContract, ReputationContract;

  before(async ()=>{
      LazyRewarderContract = await LazyRewarder.deployed({from: accounts[0]});
      ReputationContract = await Reputation.new(LazyRewarderContract.address, {from:accounts[0]});
      TokensContract = await Tokens.new(LazyRewarderContract.address, {from:accounts[0]});
  });
  
  it("Give Reputation", async()=>{
    let gas = 0;
    for(let i=0; i<100; i++){
      let tx = await LazyRewarderContract.addRPsToAccount(ReputationContract.address, accounts[i], 100);
      //console.log(tx.receipt.gasUsed)
      gas += tx.receipt.gasUsed;
    }
    console.log(gas);
    const balance = await ReputationContract.balanceOf(accounts[1]);
    assert.equal(balance, 100, "Error: RPs have not been added to user");
  });

  it("Give Reputation to trigger interest computation", async()=>{
    //skip to next week
    await time.increase(60*60*24*7);
    let gas=0;
    for(let i=0; i<100; i++){
      let tx = await LazyRewarderContract.addRPsToAccount(ReputationContract.address, accounts[i], 1);
      //console.log(tx.receipt.gasUsed)
      gas += tx.receipt.gasUsed;
    }
    console.log(gas)
    const balance = await ReputationContract.balanceOf(accounts[1]);
    assert.equal(balance, 101, "error no ct gained");
  });

  it("Redeem Tokens" , async()=>{
    //skip to next week
    await time.increase(60*60*24*7);
    let gas = 0;
    for(let i=0; i<100; i++){
      let tx = await LazyRewarderContract.redeem(TokensContract.address, {from: accounts[i]});
      //console.log(tx.receipt.gasUsed);
      gas += tx.receipt.gasUsed;
    }
    console.log(gas)
  });      
});