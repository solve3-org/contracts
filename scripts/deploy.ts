import { ContractFactory } from "ethers";
import hre, { ethers, run, upgrades } from "hardhat";

export async function deployMaster() {
  const networkName = hre.network.name;

  console.log(`
    ////////////////////////////////////////////////////
            Deploys Solve3Master.sol on ${networkName}
    ////////////////////////////////////////////////////
  `);

  const solve3MasterFactory = await ethers.getContractFactory("Solve3Master");
  const instance = await upgrades.deployProxy(
    solve3MasterFactory as unknown as ContractFactory,
    [process.env.SIGNER],
  );
  await instance.waitForDeployment();

  console.log("Solve3Master.sol deployed to:", instance.target);
  console.log(
    "Implementation address: ",
    await upgrades.erc1967.getImplementationAddress(instance.target as string),
  );

  await run("verify:verify", {
    address: instance.target,
  });
}

deployMaster().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
