import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
//import and config dotenv
import dotenv from "dotenv";

dotenv.config();

let deployPrivateKey = process.env.DEPLOYER_PRIVATE_KEY as string;
if (!deployPrivateKey) {
  throw "No deployer private key set in .env";
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 400,
      },
    },
  },
  networks: {
    goerli: {
      accounts: [deployPrivateKey],
      chainId: 5,
      url: "https://eth-goerli.public.blastapi.io",
    },
    sepolia: {
      accounts: [deployPrivateKey],
      chainId: 11155111,
      url: "https://gateway.tenderly.co/public/sepolia",
    },
    mainnet: {
      accounts: [deployPrivateKey],
      chainId: 1,
      url: "https://eth-mainnet.public.blastapi.io",
    },
    arbitrum: {
      accounts: [deployPrivateKey],
      chainId: 42161,
      url: "https://rpc.arb1.arbitrum.gateway.fm",
    },
    polygon: {
      accounts: [deployPrivateKey],
      chainId: 137,
      url: "https://poly-rpc.gateway.pokt.network",
    },
    optimism: {
      accounts: [deployPrivateKey],
      chainId: 10,
      url: "https://optimism.blockpi.network/v1/rpc/public",
    },
    avalanche: {
      accounts: [deployPrivateKey],
      chainId: 43114,
      url: "https://avalanche-c-chain.publicnode.com",
    },
    base: {
      accounts: [deployPrivateKey],
      chainId: 8453,
      url: "https://rpc.notadegen.com/base",
    },
    gnosis: {
      accounts: [deployPrivateKey],
      chainId: 100,
      url: "https://rpc.gnosischain.com",
    },
    celo: {
      accounts: [deployPrivateKey],
      chainId: 42220,
      url: "https://1rpc.io/celo",
    },
    fantom: {
      accounts: [deployPrivateKey],
      chainId: 250,
      url: "https://rpc.fantom.network",
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
    },
  },
};

export default config;
