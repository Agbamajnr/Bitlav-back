const app = require('express')()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())
const http = require('http').Server(app)
const expressWs = require('express-ws')
expressWs(app, http);


//models
const User = require('./models/user.model');
const Transaction = require('./models/transaction.model');
const axios = require('axios');

const moment = require('moment');
let time = moment().format('LTS')
let date = moment().format('L')
let currentDate = moment().format('LLL')

// helpers
const sendToWallet = require('./helpers/sendToWallet')

// tron network
const TronWeb = require('tronweb')
const { appendFileSync } = require('fs')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = '573C602BF65AD5FB1BBCD1FA8D9A6399C41B934C9AECF158300B0AC07F040894';


const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

let dbUrl = 'mongodb+srv://agbamajnr:brainbox@learn-node.tv0ge.mongodb.net/bitlav?retryWrites=true&w=majority'
// connect to mongoose
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('connected');
    })
    .catch((err) => {
        console.log('err occured', err);
    });

// check connection
mongoose.connection.on('connected', () => {
    try {
        http.listen(process.env.PORT || 6450, () => {
            console.log('Listening on port 6450');
        })
        console.log('Success in connecting to database');
    } catch (err) {
        console.log('Failed to Connect with Error', err)
    }
});


// main routings



// Get the route / 
app.get('/', (req, res) => {
    res.status(200).send("This is a spoilt URL");
});

// Get websocket route
app.ws('/deposit/:id', async function (ws, req) {
    // ws.on('message', function (msg) {
    //     // Let's put our message in JSON.stringify, and send it to the user who just sent the message
    //     ws.send('nice one');
    // });
    console.log(req.params.id)
    const user = await User.findById(req.params.id);

    checkDeposit()

    async function checkDeposit() {

        if (user !== null) {


            async function triggerSmartContract(address) {
                const trc20ContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//usdt contract address

                try {
                    let contract = await tronWeb.contract().at(trc20ContractAddress);
                    //Use call to execute a pure or view smart contract method.
                    // These methods do not modify the blockchain, do not cost anything to execute and are also not broadcasted to the network.
                    let result = await contract.balanceOf(address).call();
                    return tronWeb.fromSun(parseInt(result.toString()));
                } catch (error) {
                    return error
                }
            }

            const balData = await triggerSmartContract(user.blockchainAddress);
            const balance = Number(balData);



            // check for new deposits
            const getDeposits = await axios.get(`https://api.trongrid.io/v1/accounts/${tronWeb.address.toHex(user.blockchainAddress)}/transactions/trc20`)

            let allDeposits = getDeposits.data.data.filter(data => {
                return user.blockchainAddress !== data.from
            })

            // get deposits amount
            if (getDeposits.data.data) {
                if (allDeposits.length > 0) {
                    if (user.transactions.length > 0) {
                        const depositCount = await Transaction.countDocuments({ txnType: 'WALLET DEPOSIT' });
                        if (allDeposits.length > depositCount) {
                            let transactions = [];

                            for (let txn of user.transactions) {
                                let newTxn = await Transaction.findById(txn);
                                transactions.push(newTxn);
                            }

                            const deposits = transactions.filter(doc => {
                                return doc.txnType === 'WALLET DEPOSIT'
                            })

                            console.log('deposits', deposits)
                            console.log('transactions', transactions)

                            let allReqIDs = []

                            allDeposits.forEach(newDeposit => {
                                allReqIDs.push(newDeposit.transaction_id)
                            })


                            deposits.forEach(async deposit => {

                                if (allReqIDs.includes(deposit.mountId) === false) {

                                    // get matching transaction
                                    let newDepo = allDeposits.filter(doc => {
                                        return doc.transaction_id !== deposit.mountId
                                    })

                                    console.log(newDepo)

                                    const send = await sendToWallet(user.privateKey, tronWeb.toSun(balance));


                                    // save for each depo
                                    newDepo.forEach(async depo => {
                                        // create new transaction

                                        const createTransaction = new Transaction({
                                            userId: user._id,
                                            amount: tronWeb.fromSun(depo.value),
                                            status: 'COMPLETED',
                                            txnType: 'WALLET DEPOSIT',
                                            mountId: depo.transaction_id || null,
                                            createdAt: moment(depo.block_timestamp).format('LLL'),
                                            time: moment(depo.block_timestamps).format('LTS'),
                                            date: moment(depo.block_timestamps).format('L')
                                        })

                                        try {
                                            const txnCreated = await createTransaction.save();
                                            user.wallet += tronWeb.fromSun(depo.value);
                                            user.transactions.push(txnCreated._id);
                                            await user.save()
                                            ws.send(user.wallet)
                                        } catch (error) {
                                            console.log('error', error);
                                        }
                                    })

                                } else console.log('already a deposit')
                            })
                        }

                    } else {
                        const send = await sendToWallet(user.privateKey, getDeposits.data.data[0].value);
                        // create new transaction
                        const createTransaction = new Transaction({
                            userId: user._id,
                            amount: tronWeb.fromSun(getDeposits.data.data[0].value),
                            status: 'COMPLETED',
                            txnType: 'WALLET DEPOSIT',
                            mountId: getDeposits.data.data[0].transaction_id,
                            createdAt: moment(getDeposits.data.data[0].block_timestamp).format('LLL'),
                            time: moment(getDeposits.data.data[0].block_timestamps).format('LTS'),
                            date: moment(getDeposits.data.data[0].block_timestamps).format('L')
                        })

                        try {
                            const txnCreated = await createTransaction.save();

                            user.wallet += tronWeb.fromSun(getDeposits.data.data[0].value);
                            user.transactions.push(txnCreated._id);
                            await user.save()
                            ws.send(user.wallet)
                        } catch (error) {
                            console.log('error', error);
                        }
                    }
                }
            }

        }
    }

    setInterval(() => {
        checkDeposit()
    }, 20000);
});


app.ws('/investment/reward/:id', async function (ws, req) {
    setInterval(async () => {
        const user = await User.findById(req.params.id);
        ws.send(user.todayEarnings)
    }, 5200);
})
