const { network, run } = require("hardhat");
const { networkConfig, devChains } = require("../network.config.js");
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const isLocalNetwork = devChains.includes(network.name);

  // when trying to deploy into a local env we can use mock contract instead of a real network one.
  let priceFeed;
  if(isLocalNetwork){
    const MockAggregator = await deployments.get("MockV3Aggregator");
    priceFeed = MockAggregator.address;
  } else {
    priceFeed = networkConfig[chainId].priceFeed;
  }

  const fundingResult = await deploy('Funding', {
    contract: 'Funding',
    from: deployer,
    args: [ priceFeed ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if(!isLocalNetwork) {
    await verify(fundingResult.address, [priceFeed]);
  }

  log('------------------------------------------------------------');
};

module.exports.tags = ['all', 'Funding'];