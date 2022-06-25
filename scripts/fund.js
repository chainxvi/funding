const { getNamedAccounts, ethers } = require('hardhat');

async function main() {
  const sendValue = ethers.utils.parseEther("1.0");
  const { deployer } = await getNamedAccounts();
  const fundingContract = await ethers.getContract('Funding', deployer);

  const tx = await fundingContract.fund({ value: sendValue });
  await tx.wait(1);

  console.log('Funding secured');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
