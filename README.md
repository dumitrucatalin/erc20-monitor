# ERC-20 Monitor

This project is an ERC-20 token balance monitoring service, built with Node.js and TypeScript.
It allows you to monitor a list of ERC-20 tokens and listen to transfer events in order to stay updated with token balances for a given wallet.

## Features

- **Token Balance Monitoring**: Continuously fetches and updates balances for a specified list of ERC-20 tokens for a wallet address.
- **Event Listener**: Listens to ERC-20 `Transfer` events to capture real-time updates for each token.
- **Ethereum Blockchain**: Leverages the Ethereum blockchain to retrieve ERC-20 token data and event logs.
- **Efficiency**: Uses web3 and ethers.js libraries for efficient interaction with the blockchain.

## Prerequisites

- **Node.js** and **npm/yarn** installed on your system.
- An Ethereum Node provider such as **Infura**, **Alchemy**, or **a local Ethereum Node**.
- **Ethers.js** library for interacting with Ethereum blockchain.
- **TypeScript** (optional, but recommended).

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/erc20-monitor.git
   cd erc20-monitor
