require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/iKpVHGd3YKFr2RQoJ8Tmi5ymrcEyA9nw"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "f86aa77b5275953acad2c72adda744fd4a8bfc343f1424a0ac7b21dffdf57097"
const COINMARKETCAP_API_KEY =
    process.env.COINMARKETCAP_API_KEY || "81829aff-8e7b-4521-9172-5dfdc7d02682"
const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "9BM737PUK5GAEZ1U52QM58YWCWG1CG1688"

module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.8" },
            { version: "0.6.6" },
            { version: "0.8.7" },
        ],
    },

    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
        customChains: [],
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}
