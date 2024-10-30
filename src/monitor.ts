import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { ERC20_ABI } from './constants';
dotenv.config();


// Setup WebSocket provider for real-time event listening
const provider = new ethers.WebSocketProvider(process.env.WSS_RPC_URL!);

const monitoredAddress = process.env.MONITORED_ADDRESS;

if (!monitoredAddress) {
    throw new Error('Please set the MONITORED_ADDRESS in your .env file');
}

interface Token {
    address: string;
    symbol: string;
    decimals: number;
}

const tokens: Token[] = [
    // Add the tokens you want to monitor here
    // These are from ETH Mainnet
    { address: '0x57e114B691Db790C35207b2e685D4A43181e6061', symbol: 'ENA', decimals: 18 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
    // ...
];



async function checkEthBalance(address: string) {
    try {
        // Get balance in Wei (the smallest unit of Ether)
        const balanceWei = await provider.getBalance(address);

        // Convert balance from Wei to Ether
        const balanceEther = ethers.formatEther(balanceWei);

        console.log(`Balance of ${address}: ${balanceEther} ETH`);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

async function getTokenBalance(contract: ethers.Contract, address: string, decimals: number) {
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, decimals);
}

async function monitorTokens() {
    for (const token of tokens) {
        try {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
            const balance = await getTokenBalance(tokenContract, monitoredAddress!, token.decimals);
            console.log(`Balance of ${token.symbol} for ${monitoredAddress}: ${balance}`);
        } catch (error) {
            console.error(`Couldn't get the balance of ${token.symbol} token`);
        }
    }
}

function listenForERC20TokenTransfers() {
    for (const token of tokens) {

        try {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);

            // Listen for Transfer events
            tokenContract.on('Transfer', (from: string, to: string, value: ethers.BigNumberish) => {
                if (from.toLowerCase() === monitoredAddress!.toLowerCase()) {
                    console.log(
                        `Sent ${ethers.formatUnits(value, token.decimals)} ${token.symbol} to ${to}`
                    );
                }
                if (to.toLowerCase() === monitoredAddress!.toLowerCase()) {
                    console.log(
                        `Received ${ethers.formatUnits(value, token.decimals)} ${token.symbol} from ${from}`
                    );
                }
            });
        } catch (error) {
            console.error(`Couldn't Listen for the balance of ${token.symbol} token`);
        }
    }
}
function listenForEthTransfers() {
    console.log(`Start listening for Incoming ETH transaction`);
    provider.on('block', async (blockNumber) => {
        try {
            // Fetch the block
            console.log(`Checking blockNumber: ${blockNumber}`);

            const block = await provider.getBlock(blockNumber);

            if (block && block.transactions) {
                // Loop over each transaction hash and fetch transaction details
                for (const txHash of block.transactions) {
                    const tx = await provider.getTransaction(txHash);

                    // Check if the transaction is sent to the monitored address
                    if (!tx) {
                        continue;
                    }

                    if (tx.to && tx.to.toLowerCase() === monitoredAddress!.toLowerCase()) {
                        console.log(`Incoming transaction to monitored address, tx.hash: ${tx.hash}`);
                        console.log(`Value: ${ethers.formatEther(tx.value)} ETH`);
                        console.log(`From: ${tx.from}`);
                    }
                    if (tx.from && tx.from.toLowerCase() === monitoredAddress!.toLowerCase()) {
                        console.log(`Incoming transaction from monitored address tx.hash: ${tx.hash}`);
                        console.log(`Value: ${ethers.formatEther(tx.value)} ETH`);
                        console.log(`to: ${tx.to}`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing block ${blockNumber}:`, error);
        }
    });
}


export async function startMonitoring() {
    try {
        console.log(`Monitoring ERC-20 tokens for address: ${monitoredAddress}`);
        await checkEthBalance(monitoredAddress!);
        await monitorTokens();
        listenForERC20TokenTransfers();
        listenForEthTransfers();
    } catch (error) {
        console.error(error)
    }
}