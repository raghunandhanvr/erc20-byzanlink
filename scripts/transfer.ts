import { ethers } from 'ethers'; // v5.7.2
import { ByzanlinkAASdk } from '@byzanlink/aa-sdk';
import { sleep } from '@byzanlink/aa-sdk/dist/sdk/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (input) => resolve(input));
    });
}

async function fundWallet(provider: ethers.providers.JsonRpcProvider, from: ethers.Wallet, to: string, amount: string): Promise<void> {
    const tx = await from.sendTransaction({
        to: to,
        value: ethers.utils.parseEther(amount)
    });
    await tx.wait();
    console.log(`Funded wallet with ${amount} MATIC`);
}

async function main() {
    const privateKey: string | undefined = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set in the environment variables");
    }

    const chainId: string | undefined = process.env.AMOY_CHAIN_ID;
    if (!chainId) {
        throw new Error("AMOY_CHAIN_ID is not set in the environment variables");
    }

    const apiKey: string | undefined = process.env.BYZANLINK_API_KEY;
    if (!apiKey) {
        throw new Error("BYZANLINK_API_KEY is not set in the environment variables");
    }

    const infuraUrl: string | undefined = process.env.INFURA_AMOY_URL;
    if (!infuraUrl) {
        throw new Error("INFURA_AMOY_URL is not set in the environment variables");
    }

    const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const deployedAddresses: string[] = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf-8'));
    const latestAddress: string = deployedAddresses[deployedAddresses.length - 1];

    const recipient: string = await getUserInput("Enter recipient wallet address (0x...): ");
    const transferAmount: string = await getUserInput("Enter transfer amount: ");

    const walletBalance = await provider.getBalance(wallet.address);
    console.log(`Wallet balance: ${ethers.utils.formatEther(walletBalance)} MATIC`);

    const byzanlinkAASdk = new ByzanlinkAASdk(wallet, { chainId: Number(chainId), apiKey });
    const address = await byzanlinkAASdk.getCounterFactualAddress();
    console.log(`Byzanlink Wallet address: ${address}`);

    let balance = await byzanlinkAASdk.getNativeBalance();
    console.log(`Byzanlink Wallet native balance: ${balance} MATIC`);

    if (parseFloat(balance) < 0.01) {
        const fundAmount = "0.05";
        console.log(`Funding Byzanlink wallet with ${fundAmount} MATIC`);
        await fundWallet(provider, wallet, address, fundAmount);
        balance = await byzanlinkAASdk.getNativeBalance();
        console.log(`New Byzanlink Wallet native balance: ${balance} MATIC`);
    }

    const ERC20_ABI = [
        "function balanceOf(address account) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)"
    ];
    const contract = new ethers.Contract(latestAddress, ERC20_ABI, wallet);

    const decimals = await contract.decimals();
    const tokenBalance = await contract.balanceOf(address);
    console.log(`Current ERC20 token balance: ${ethers.utils.formatUnits(tokenBalance, decimals)} MTK`);

    await byzanlinkAASdk.clearUserOpsFromBatch();

    const transferData = contract.interface.encodeFunctionData('transfer', [recipient, ethers.utils.parseUnits(transferAmount, decimals)]);
    await byzanlinkAASdk.addUserOpsToBatch({ to: latestAddress, data: transferData });

    const op = await byzanlinkAASdk.estimate();
    console.log(`User Op: ${JSON.stringify(op)}`);

    const uoHash = await byzanlinkAASdk.send(op);
    console.log(`UserOpHash: ${uoHash}`);

    console.log('Waiting for transaction...');
    let userOpsReceipt = null;
    const timeout = Date.now() + 60000;
    while (!userOpsReceipt && Date.now() < timeout) {
        await sleep(2);
        userOpsReceipt = await byzanlinkAASdk.getUserOpReceipt(uoHash);
    }
    console.log('Transaction Receipt: ', userOpsReceipt);

    const newTokenBalance = await contract.balanceOf(address);
    console.log(`New Byzanlink Wallet balance: ${ethers.utils.formatUnits(newTokenBalance, decimals)} MTK`);

    const recipientBalance = await contract.balanceOf(recipient);
    console.log(`Recipient balance: ${ethers.utils.formatUnits(recipientBalance, decimals)} MTK`);

    rl.close();
}

main().catch(console.error).finally(() => process.exit());
