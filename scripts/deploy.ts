import { ethers } from "hardhat";
import { ByzanlinkAASdk } from '@byzanlink/aa-sdk';
import * as dotenv from "dotenv";
import * as fs from 'fs';
import { Wallet } from 'ethers';

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ERC20Token = await ethers.getContractFactory("ERC20Token");
  const token = await ERC20Token.deploy("MyToken", "MTK");

  await token.deployed();

  console.log("ERC20 Token deployed to:", token.address);

  const deployedAddresses = fs.existsSync('deployed-addresses.json') 
    ? JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf-8')) 
    : [];
  deployedAddresses.push(token.address);
  fs.writeFileSync('deployed-addresses.json', JSON.stringify(deployedAddresses));

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is not set");
  }
  const wallet = new Wallet(privateKey, ethers.provider);

  const byzanlinkAASdk = new ByzanlinkAASdk(
    wallet,
    {
      chainId: Number(process.env.AMOY_CHAIN_ID),
      apiKey: process.env.BYZANLINK_API_KEY
    }
  );

  const byzanlinkWalletAddress = await byzanlinkAASdk.getCounterFactualAddress();
  console.log("Byzanlink Wallet address:", byzanlinkWalletAddress);

  let balance = await token.balanceOf(byzanlinkWalletAddress);
  console.log(`Initial Byzanlink Wallet balance: ${ethers.utils.formatUnits(balance, 18)} MTK`);

  const mintAmount = ethers.utils.parseUnits("1000", 18);
  console.log("Minting tokens...");
  const mintTx = await token.mint(byzanlinkWalletAddress, mintAmount);
  console.log("Mint transaction hash:", mintTx.hash);
  await mintTx.wait();
  console.log("Mint transaction confirmed");

  console.log(`Minted ${ethers.utils.formatUnits(mintAmount, 18)} MTK to ${byzanlinkWalletAddress}`);

  balance = await token.balanceOf(byzanlinkWalletAddress);
  console.log(`Byzanlink Wallet balance after minting: ${ethers.utils.formatUnits(balance, 18)} MTK`);

  const totalSupply = await token.totalSupply();
  console.log(`Total supply: ${ethers.utils.formatUnits(totalSupply, 18)} MTK`);

  const deployerBalance = await token.balanceOf(deployer.address);
  console.log(`Deployer balance: ${ethers.utils.formatUnits(deployerBalance, 18)} MTK`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});