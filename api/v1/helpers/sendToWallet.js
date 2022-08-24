// tron network
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = process.ACC_PRIVATE_KEY;


const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

const CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT
const ACCOUNT = "TXdFBQYvy6EsWnUp98KaTp4ajM4QyiZccu";

async function sendToWallet(userPK, amount) {
    try {
        const ownerAddress = tronWeb.address.fromPrivateKey(userPK);
        const contractAddressHex = tronWeb.address.toHex(CONTRACT);
        const contractInstance = await tronWeb.contract().at(contractAddressHex);
        const decimals = await contractInstance.decimals().call();
        const response = await contractInstance.transfer(ACCOUNT, amount).send();
    } catch (e) {
        console.error(e);
        return null;
    }
}

module.exports = sendToWallet;