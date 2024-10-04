import type { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    // only testnets, change to mainnet if required
    sepolia: {
      url: process.env.INFURA_SEPOLIA_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: parseInt(process.env.CHAIN_ID || '11155111'),
      gasPrice: 1000000000,
      gas: 500000
    },
    amoy: {
      url: process.env.INFURA_AMOY_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: parseInt(process.env.AMOY_CHAIN_ID || '80002')
    }
  }
};

export default config;
