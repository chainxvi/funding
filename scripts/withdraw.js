const { getNamedAccounts, ethers } = require('hardhat');

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundingContract = await ethers.getContract('Funding', deployer);

  let balance = await fundingContract.provider.getBalance(fundingContract.address);
  let deployerBalance = await fundingContract.provider.getBalance(deployer);
  
  console.log(ethers.utils.formatEther(balance));
  console.log(ethers.utils.formatEther(deployerBalance));
  
  console.log('Withdrawing...');
  const tx = await fundingContract.withdraw();
  await tx.wait(1);
  console.log('Withdrew...');

  balance = await fundingContract.provider.getBalance(fundingContract.address);
  deployerBalance = await fundingContract.provider.getBalance(deployer);
  
  console.log(ethers.utils.formatEther(balance));
  console.log(ethers.utils.formatEther(deployerBalance));

  console.log('Withdrew funds');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
