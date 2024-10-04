## Ethereum Wallet Transaction Script

This Node.js application demonstrates the process of managing and transferring ERC-20 tokens on the Ethereum blockchain. It leverages the Byzanlink SDK to facilitate complex interactions between digital wallets using smart contract functionalities, specifically focusing on token transactions. This script provides a user-friendly interface to input transaction details and handles all the necessary blockchain interactions, including wallet funding and transaction confirmations.

Try running some of the following tasks to get started:

1. Create the .env file with the .env.example file as a template.
2. For the Infura Project ID, navigate to https://app.infura.io/key/ and create a new project. Once the project is created, copy the project ID and paste it into the .env file.
3. Navigate to https://dev.byzanlink.com/apps and create a new app. Once the app is created, copy the API key and paste it into the .env file.
4. To start the project, run the following command:

```shell
# Install the required dependencies
npm i

# Deploy the ERC20Token contract, replace amoy with the network you want to deploy to
npx hardhat run scripts/deploy.ts --network amoy

# Transfer tokens to another wallet, follow the prompts to input the recipient address and amount
npx ts-node scripts/transfer.ts 
```

### References: 
1. https://docs.byzanlink.com/
2. https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos
3. https://app.infura.io/
4. https://chainlist.org/
5. https://dev.byzanlink.com/
6. https://metamask.io/
7. https://etherscan.io/