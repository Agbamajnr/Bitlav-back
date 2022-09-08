// tron network
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = '573C602BF65AD5FB1BBCD1FA8D9A6399C41B934C9AECF158300B0AC07F040894';


const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

const CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT
const ACCOUNT = "TApg7EBMwqBSdTSpMGx3MARad8UEkxK5ET";

async function sendToWallet(userPK, amount) {
    try {
        const ownerAddress = tronWeb.address.fromPrivateKey(userPK);
        const contractAddressHex = tronWeb.address.toHex(CONTRACT);
        const contractInstance = await tronWeb.contract().at(contractAddressHex);
        const decimals = await contractInstance.decimals().call();
        const response = await contractInstance.transfer(ACCOUNT, amount).send();

        return {
            message: 'Sent'
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

module.exports = sendToWallet;