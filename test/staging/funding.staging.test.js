// testnet staging tests.
const { assert } = require('chai');
const { network } = require('hardhat');
const { devChains } = require('../../network.config.js');

devChains.includes(network.name) ?
describe.skip :
describe("Funding", async function () {
  let fundingContract;
  const sendValue = ethers.utils.parseEther("0.1");
  before(async function () {
    deployer = (await getNamedAccounts()).deployer;
    fundingContract = await ethers.getContract('Funding', deployer);
  })

  it('allows funding and withdrawing', async function () {
    await fundingContract.fund({ value: sendValue });
    const balance = await fundingContract.provider.getBalance(fundingContract.address);
    
    await fundingContract.withdraw();
    const withdrawnbalance = await fundingContract.provider.getBalance(fundingContract.address);
    
    assert.equal(balance.toString(), sendValue.toString());
    assert.equal(withdrawnbalance, 0);
  })
})