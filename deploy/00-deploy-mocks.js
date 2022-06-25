const { network } = require("hardhat");
const { devChains } = require("../network.config.js");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if(devChains.includes(network.name)) {
    // deploy mocks
    log('Deploying mocks');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      args: [ 8, 200000000000 ],
      log: true
    });
    log(
      `------------------------------------------------------------`
    );
  }
};

module.exports.tags = ['all', 'mocks'];