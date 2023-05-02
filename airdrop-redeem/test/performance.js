const Reputation = artifacts.require("Reputation");
const Tokens = artifacts.require("Tokens");
const RedeemAirdropRewarder = artifacts.require("RedeemAirdropRewarder");
const { time } = require('../node_modules/@openzeppelin/test-helpers');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

contract("Performance", (accounts) => {

  let TokensContract, RedeemAirdropRewarderContract, ReputationContract;

  before(async ()=>{
      RedeemAirdropRewarderContract = await RedeemAirdropRewarder.deployed({from: accounts[0]});
      ReputationContract = await Reputation.new(RedeemAirdropRewarderContract.address, {from:accounts[0]});
      TokensContract = await Tokens.new(RedeemAirdropRewarderContract.address, {from:accounts[0]});
  });
  
  it("Give Reputation", async()=>{
    let gas = 0;
    for(let i=0; i<100; i++){
      let tx = await RedeemAirdropRewarderContract.addRPsToAccount(ReputationContract.address, accounts[i], 100);
      //console.log(tx.receipt.gasUsed)
      gas += tx.receipt.gasUsed;
    }
    console.log(gas)
    const balance = await ReputationContract.balanceOf(accounts[1]);
    assert.equal(balance, 100, "Error: RPs have not been added to user");
  });

  it("Give Reputation (1 week time skip)", async()=>{
    //skip to next week
    await time.increase(60*60*24*7);

    let gas = 0;
    for(let i=0; i<100; i++){
      let tx = await RedeemAirdropRewarderContract.addRPsToAccount(ReputationContract.address, accounts[i], 100);
      //console.log(tx.receipt.gasUsed);
      gas += tx.receipt.gasUsed;
    }
    console.log(gas)
    const balance = await ReputationContract.balanceOf(accounts[1]);
    assert.equal(balance, 200 , "error no ct gained");
  });

  it("Subscribe to Airdrop" , async()=>{

    //subscribe
    let gas = 0;
    for(let i=0; i<100; i++){
        let tx = await RedeemAirdropRewarderContract.subscribeToAirdrop({from: accounts[i]});
        //console.log(tx.receipt.gasUsed);
        gas += tx.receipt.gasUsed;
    }
    console.log(gas)
  });

  it("Airdrop", async()=>{

    //skip four weeks
    await time.increase(60*60*24*7*4);
    let tx = await RedeemAirdropRewarderContract.airdrop(ReputationContract.address, {from: accounts[1]});
    console.log(tx.receipt.gasUsed);
  });

  it("Redeem", async()=>{
    let gas = 0;
    for(let i=0; i<100; i++){
      const tx = await RedeemAirdropRewarderContract.redeem(TokensContract.address, {from: accounts[i]});
      //console.log(tx.receipt.gasUsed);
      gas += tx.receipt.gasUsed;
    }
    console.log(gas)
  });

  it("Check balances", async()=>{
    const ctBalance = await TokensContract.balanceOf(accounts[1]);
    console.log(`Balance of ${accounts[1]} is ${ctBalance} Community Token`);
    assert.isTrue(ctBalance>0);
  });
     
});