import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";

//import and config dotenv
import dotenv from "dotenv";

dotenv.config();

const deployPrivateKey = (process.env.DEPLOYER_PRIVATE_KEY as string) || "";

let networks = {};

if (deployPrivateKey !== "") {
  networks = {
    goerli: {
      accounts: [deployPrivateKey],
      chainId: 5,
      url: "https://eth-goerli.public.blastapi.io",
    },
    sepolia: {
      accounts: [deployPrivateKey],
      chainId: 11155111,
      url: "https://1rpc.io/sepolia",
    },
    optimism: {
      accounts: [deployPrivateKey],
      chainId: 10,
      url: "https://optimism.blockpi.network/v1/rpc/public",
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
      gasPrice: 200000000000,
    },
    avalanche: {
      accounts: [deployPrivateKey],
      chainId: 43114,
      url: "https://avalanche-c-chain.publicnode.com",
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
    base: {
      accounts: [deployPrivateKey],
      chainId: 8453,
      url: "https://rpc.notadegen.com/base",
    },
    mainnet: {
      accounts: [deployPrivateKey],
      chainId: 1,
      url: "https://eth-mainnet.public.blastapi.io",
    },
  };
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 400,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200,
          },
        },
      },
    ],
  },
  networks,
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      xdai: process.env.GNOSISSCAN_API_KEY || "",
      celo: process.env.CELOSCAN_API_KEY || "",
      opera: process.env.FTMSCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
