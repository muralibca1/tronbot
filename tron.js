require("dotenv").config();
const TronWeb = require("tronweb");

// Set up the TronWeb connection using free public RPC
const fullNode = "https://api.trongrid.io"; // Public Tron RPC endpoint
const solidityNode = "https://api.trongrid.io"; // Public Tron RPC endpoint
const eventServer = "https://api.trongrid.io"; // Public Tron RPC endpoint

// Create a new instance of TronWeb using the correct constructor method for recent versions
const tronWeb = new TronWeb(
  fullNode, // fullHost URL
  solidityNode, // solidityNode URL
  eventServer // eventServer URL
);

// Load private key and destination address from environment variables
const privateKey = process.env.PRIVATE_KEY;
const destinationAddress = process.env.DESTINATION_ADDRESS;

// Ensure the private key is loaded
if (!privateKey) {
  console.error("Private key not found in .env file");
  process.exit(1);
}

// Set the private key for TronWeb
tronWeb.setPrivateKey(privateKey);

// Get the wallet address from the private key
const walletAddress = tronWeb.address.fromPrivateKey(privateKey);
console.log(`Monitoring wallet address: ${walletAddress}`);

// Function to check balance and transfer TRX
async function checkAndTransfer() {
  try {
    // Get the balance of the wallet
    const balance = await tronWeb.trx.getBalance(walletAddress);

    // If balance is greater than 0, transfer all TRX to the destination address
    if (balance > 0) {
      console.log(`Received ${balance} TRX`);

      // Create the transaction to send all TRX to the destination address
      const transaction = await tronWeb.transactionBuilder.sendTrx(
        destinationAddress,
        balance,
        walletAddress
      );

      // Sign the transaction with the private key
      const signedTransaction = await tronWeb.trx.sign(transaction);

      // Send the signed transaction
      const broadcastResult = await tronWeb.trx.sendRawTransaction(
        signedTransaction
      );

      if (broadcastResult.result) {
        console.log("Transfer successful!");
      } else {
        console.log("Transfer failed:", broadcastResult);
      }
    } else {
      console.log("No TRX received.");
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

// Check for TRX every 3 seconds
setInterval(checkAndTransfer, 2000); // 2000 ms = 2 seconds
