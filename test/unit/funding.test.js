const { assert, expect } = require('chai');
const { network, deployments, ethers, getNamedAccounts } = require('hardhat');
const { devChains } = require('../../network.config.js');

// Unit Tests take the structure of the contract

devChains.includes(network.name) ?
describe('Funding', async function() {
  let fundingContract;
  let mockV3AggregatorContract;
  const sendValue = ethers.utils.parseEther("1.0");
  before(async function () {
    deployer = (await getNamedAccounts()).deployer;
    // deploy the files with the tag "all"
    await deployments.fixture(['all']);
    // connecting the deployer to the contract (for testing purposes) so that the deployer calls everything from the contract.
    fundingContract = await ethers.getContract('Funding', deployer);
    mockV3AggregatorContract = await ethers.getContract('MockV3Aggregator', deployer);
  })

  describe('constructor', async function() {
    it('Sets the fundingOwner to actually the deployer of the contract', async () => {
      const fundingOwner = await fundingContract.fundingOwner();
      assert.equal(fundingOwner, deployer);
    })

    it('Sets the aggregator address correctly', async () => {
      const priceFeed = await fundingContract.priceFeed();
      assert.equal(priceFeed, mockV3AggregatorContract.address);
    })
  })

  describe('fund', async function() {
    it('Fails if you send less than minimum', async function() {
      await expect(fundingContract.fund()).to.be.reverted;
    })

    it('The funderToAmount array is populated with amounts and the funders', async function() {
      await fundingContract.fund({
        value: sendValue
      });
      const funderToAmount = await fundingContract.funderToAmount(deployer);
      assert.equal(funderToAmount.toString(), sendValue.toString());
    })

    it('The funders array is populated only when there is no funder with sender\'s address', async function() {
      await fundingContract.fund({
        value: sendValue
      });

      const funderToExists = await fundingContract.funderToExists(deployer);
      const funder = await fundingContract.funders(0);
      assert.equal(funder, deployer);
      assert.isTrue(funderToExists);
    })
  })

  describe('withdraw', async function () {
    beforeEach(async function () {
      await fundingContract.fund({
        value: sendValue
      });
    })

    it('Withdraw ETH from the contract', async function () {
      // initial balance of contract and deployer
      const startingContractBalance = await ethers.provider.getBalance(fundingContract.address);
      const startingDeployerBalance = await ethers.provider.getBalance(deployer);
      
      // call the withdraw function
      const tx = await fundingContract.withdraw();
      const receipt = await tx.wait(1);
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      // ending balance of contract and deployer
      const withdrawnContractBalance = await ethers.provider.getBalance(fundingContract.address);
      const withdrawnDeployerBalance = await ethers.provider.getBalance(deployer);
      
      // testing
      assert.equal(withdrawnContractBalance, 0);
      assert.equal(
        withdrawnDeployerBalance.add(gasCost).toString(),
        startingDeployerBalance.add(startingContractBalance).toString()
      );
      assert.notEqual(startingContractBalance, withdrawnContractBalance);
    });

    it('List of funders is empty after withdrawing', async function() {
      await fundingContract.withdraw();
      const funders = await fundingContract.funders;
      expect(funders(0)).to.be.reverted;
    })

    it('withdraw ETH if there are multiple funders', async function() {
      const accounts = await (await ethers.getSigners()).slice(0, 6);
      accounts.forEach(async acc => {
        const fundingConnectedToDifferentAccount = await fundingContract.connect(acc);
        await fundingConnectedToDifferentAccount.fund({
          value: sendValue
        });
      })

      const startingContractBalance = await ethers.provider.getBalance(fundingContract.address);
      const startingDeployerBalance = await ethers.provider.getBalance(deployer);

      // call the withdraw function
      const tx = await fundingContract.withdraw();
      const receipt = await tx.wait(1);
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const funders = fundingContract.funders;
      
      // ending balance of contract and deployer
      const withdrawnContractBalance = await ethers.provider.getBalance(fundingContract.address);
      const withdrawnDeployerBalance = await ethers.provider.getBalance(deployer);

      // testing
      assert.equal(withdrawnContractBalance, 0);
      assert.equal(
        withdrawnDeployerBalance.add(gasCost).toString(),
        startingDeployerBalance.add(startingContractBalance).toString()
      );
      assert.notEqual(startingContractBalance, withdrawnContractBalance);
      // this is how you check if the array is empty
      expect(funders(0)).to.be.reverted;
      const allFundersAmountIsZero = accounts.every(async ac => {
        await fundingContract.funderToAmount(ac.address) === 0
      })
      assert.isTrue(allFundersAmountIsZero);
    })

    it('Only the owner should be able to withdraw funds', async function () {
      // arrange
      const accounts = await (await ethers.getSigners()).slice(0, 6);
      accounts.forEach(async acc => {
        const fundingConnectedToDifferentAccount = await fundingContract.connect(acc);
        await fundingConnectedToDifferentAccount.fund({
          value: sendValue
        });
      })
      
      // act
      const fundingConnectedToDifferentAccount = await fundingContract.connect(accounts[1]);

      // assert
      await expect(fundingConnectedToDifferentAccount.withdraw()).to.be.revertedWith('Funding__NotOwner');
    })
  })
})
: describe.skip