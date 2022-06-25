const { run } = require('hardhat');

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
    address: contractAddress,
    constructorArguments: args,
    });
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  verify
};