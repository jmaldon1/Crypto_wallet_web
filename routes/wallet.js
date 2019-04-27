const express = require("express");
const router = express.Router();
var path = require('path');
var usb = require('usb');
const request = require("request-promise");
const txValidation = require("../middleware/transactionValidation").txValidation;
var bitcoin = require('bitcoinjs-lib');
var moment = require('moment');
const uuidv4 = require('uuid/v4');
const testnet = bitcoin.networks.testnet
const FPGA = true;

// var accountArray = [];

/* Global USB variables */
var FPGAdevice = usb.findByIds(0x10c4, 0xea60);
var isDeviceConnected = checkDeviceConnection(FPGAdevice);
var inEndpoint;
var outEndpoint;

/* USB listeners */
checkUSBAttach()
checkUSBDetach();

var accountArray = [
    {
        "addresses": [
            {
                "keypath": "m/44h/1h/0h/0/0",
                "address": "mx97R1ymecapsDH8t7jVNH9henf8vxzuGD",
                "numOfTx": 0,
                "balance": 0,
                "utxs": [],
                "used": false,
                "change": false,
                "unconfirmedTxs": [],
                "unconfirmedTxTotalBalance": 0,
                "id": 0
            },
            {
                "keypath": "m/44h/1h/0h/0/1",
                "address": "2NAZ2GVgh1BQvQQeC5GwoKj4v4bk4K2wqgR",
                "numOfTx": 0,
                "balance" : 0,
                "utxs": [],
                "used": false,
                "change": false,
                "unconfirmedTxs": [],
                unconfirmedTxTotalBalance: 0,
                "id": 1
            },
            {
                "keypath": "m/44h/1h/0h/0/2",
                "address": "moHSnM84HuhTRv1kzhz8LJmzEMV18rBHeR",
                "numOfTx": 0,
                "balance" : 0,
                "utxs": [],
                "used": false,
                "change": false,
                "unconfirmedTxs": [],
                unconfirmedTxTotalBalance: 0,
                "id": 2
            },
            // {
            //     "keypath": "m/44h/1h/0h/1/0",
            //     "address": "mp8hL5KPhy71XU8Q1HfaYtJYJHcBMciFKN",
            //     "numOfTx": 0,
            //     "balance" : 0,
            //     "utxs": [],
            //     "used": false,
            //     "change": true,
            //     "unconfirmedTxs": 0,
            //     "id": 3
            // }
        ],
        "id": 1,
        "name": "Account #1",
        "balance": 0,
        "txs": [],
        "defaultAccount": true,
        "nextAddrIdx": 3,
        "nextChangeIdx": 1,
        "time": null
    },
    {
        "addresses": [
            {
                "keypath": "m/44h/1h/1h/0/0",
                "address": "mp8hL5KPhy71XU8Q1HfaYtJYJHcBMciFKN",
                "numOfTx": 0,
                "balance" : 0,
                "utxs": [],
                "used": false,
                "change": false,
                "unconfirmedTxs": [],
                "unconfirmedTxTotalBalance": 0,
                "id": 0
            }
        ],
        "id": 2,
        "name": "Account #2",
        "balance": 0,
        "txs": [],
        "defaultAccount": false,
        "nextAddrIdx": 1,
        "nextChangeIdx": 0,
        "time": null
    },
    // {
    //     "addresses": [
    //         {
    //             "keypath": "m/44h/0h/2h/0/0",
    //             "address": "mx97R1ymecapsDH8t7jVNH9henf8vxzuGD",
    //             "used": false
    //         }
    //     ],
    //     "id": 3,
    //     "name": "Account #3",
    //     "defaultAccount": false
    // }
]

router.get('/usbConnect', async (req, res) => {
	try{
		if(isDeviceConnected === false){
			return res.json({"deviceConnection": false})
		}
		return res.json({"deviceConnection": true})
	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
})

router.get('/accounts', async (req, res) => {
	try{
		var nextAccount = getMissingMinAccountIdx()
		return res.json({"accounts": accountArray, "nextAccount": nextAccount});
	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
});

router.post("/addAccount", async (req, res) => {
	try{
		accountIdx = getMissingMinAccountIdx();
		// address = null;
		
		/* Account */
		var tempAccountDict = {}
		tempAccountDict = {}
		tempAccountDict['addresses'] = []
		tempAccountDict['id'] = accountIdx
		var name;
		!req.body.name ? name = 'Account #' + accountIdx : name = req.body.name;
		tempAccountDict['name'] = name
		tempAccountDict['nextAddrIdx'] = 0
		tempAccountDict['nextChangeIdx'] = 0
		tempAccountDict['txs'] = []
		tempAccountDict['balance'] = 0
		tempAccountDict['time'] = moment().unix()

		/* Address */
		var tempAddressDict = {}
		var keyPath = 'm/44h/1h/' + (accountIdx-1) + 'h/0/0';
		tempAddressDict['keypath'] = keyPath
		tempAddressDict['used'] = false
		tempAddressDict['balance'] = 0
		tempAddressDict['numOfTx'] = 0;
		tempAddressDict['utxs'] = []
		tempAddressDict['id'] = 0
		tempAddressDict['change'] = false
		tempAddressDict['unconfirmedTxs'] = []
		tempAddressDict['unconfirmedTxTotalBalance'] = 0
		
		/* TALK TO FPGA */
		/*
		1. Create Master Key
		2. Derive Child node from master key
		3. Send Public Address back to here
		*/

		/* if this is the first account being created, the FPGA needs to create a masterkey */
		// if(accountIdx === 1){
		// 	var payload = 'masterkey:' + keyPath;
		// 	await sendDataToUSB(outEndpoint, payload);

		// 	var response = await receiveDataFromUSB(inEndpoint);

		// 	console.log("received: " + response)
		// 	// address should be recieved
		// 	var address = response.trim();
		// }else{
		// 	var payload = 'keypath:' + keyPath;
		// 	/* any other account we will only need to retrieve the address that the FPGA creates */
		// 	await sendDataToUSB(outEndpoint, payload);

		// 	var response = await receiveDataFromUSB(inEndpoint);

		// 	console.log("received: " + response)
		// 	// address should be recieved
		// 	var address = response.trim();
		// }

		var payload = 'keypath:' + keyPath;
		// var payload = "sign:0200000001e0d24d3d814b74981ec7279538bccf2f382cba1e2c02b97f463738ecffb0ecf90000000000ffffffff0128230000000000001976a914afc0c23e6fc5341d70656c17a532c229b1dbac7f88ac00000000:76a914d19f78e626237078a09c1e1eafbf3b97561cc56788ac:mzdLZURNgmdkiE8dvntshSLnKwd5F5vT1S:1"
		/* any other account we will only need to retrieve the address that the FPGA creates */
		await sendDataToUSB(outEndpoint, payload);

		var response = await receiveDataFromUSB(inEndpoint);

		console.log("received: " + response)
		// address should be recieved
		var address = response.trim();

		// const keyPair = bitcoin.ECPair.makeRandom({ network: testnet })
		// const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet })

		tempAccountDict.nextAddrIdx += 1;

		tempAddressDict['address'] = address;

		tempAccountDict['addresses'].push(tempAddressDict);

		/* set the first account to the default account */
		accountIdx === 1 && accountArray.length === 0 ? tempAccountDict['defaultAccount'] = true : tempAccountDict['defaultAccount'] = false;

		accountArray.push(tempAccountDict)

		nextAccount = getMissingMinAccountIdx();
		// console.log(JSON.stringify(accountArray, null, 4))

		/*TALK TO FPGA AND GET Address for Keypath 'm/44h/0h/account#/0/0' 
			Add this Address to the accountInfo Dict
			Ex:
				[
					{
					addresses: [
						{keypath: m/44h/0h/account#/0/0, 
						address: mypWkrXYJTg1hgiWx1ugbhfLrAHdstgsvK, 
						balance: 10000, 
						used: true},
						...
						]
					id: accountIdx
					name: account #1
					},
				]

			The 'used' key is to indicate weather an address with balance 0 once had balance on it and should no longer be used
		*/

		return res.json({"accounts": accountArray, "nextAccount": nextAccount})
	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
});

router.post('/deleteAccount', async (req, res) => {
	try{
		if (!req.body.idx) throw "Must Provide Account ID"
		var accountData = accountArray.find(account => {
		  return req.body.idx === account.id;
		})
		if(!accountData) throw "Account not found"
		if(accountData.defaultAccount === true) throw "Set a new default account before deleting"

		/* Use the index of account that the user wants to delete and remove it from the accountArray */
		accountArray.splice(accountArray.map(function(x) {return x.id; }).indexOf(req.body.idx), 1);
		return res.json(accountArray);
	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
});

router.post('/defaultAccount', async (req, res) => {
	try{
		if (!req.body.idx) throw "Must Provide Account ID"
		var accountData = accountArray.find(account => {
		  return req.body.idx === account.id;
		})
		if(!accountData) throw "Account not found"
		if(accountData.defaultAccount === true) throw "This account is already the default account"

		/* Unsets the current default account */
		var currentDefaultAccount = accountArray.find(account => {
		  return account.defaultAccount === true;
		})
		if (currentDefaultAccount) currentDefaultAccount.defaultAccount = false;

		/* Sets the new default account */
		accountArray[accountArray.map(function(x) {return x.id; }).indexOf(req.body.idx)].defaultAccount = true
		return res.json(accountArray)
	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
});

router.post('/createAddress', async (req, res) => {
	try{
		// GET IDX OF CURRENT ACCOUNT FROM POST REQUEST
		var accountData = await createAddress(req.body.idx, req.body.change)

		// console.log(JSON.stringify(accountArray, null, 4))
		accountData.time = moment().unix();
		return res.json(accountData);
	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
});

router.post('/checkBalance', async (req, res) => {
	try{
		if (!req.body.idx) throw "Must Provide Account ID"
		// GET IDX OF CURRENT ACCOUNT FROM POST REQUEST
		var addressArr = []
		var tempUtxDict = {}
		var tempTxDict = {}
		var txExists;
		var accountData = accountArray.filter(function(account) {
		    return account.id === req.body.idx;
		})[0];

		if(!accountData) throw "Account not found"

		/* get all unused addresses */
		// const unusedAddresses = accountData.addresses.filter(account => account['used'] === false);
		// unusedAddresses.forEach(e => addressArr.push(e.address))

		/* put all addresses into an array */
		accountData.addresses.forEach(e => addressArr.push(e.address))

		/* if there are no addresses to check the balance of return */
		if(addressArr.length === 0){
			accountData.time = moment().unix()
			return res.json(accountData)
		}

		/* ---- EVERYTHING BELOW IS FOR SMARTBIT API ---- */

		// /* Make all API calls required */
		// var requestURL = 'https://testnet-api.smartbit.com.au/v1/blockchain/address/'
		// 				 + addressArr.join(',');
		// var addrResponse = await request({url: requestURL})
		// addrResponse = JSON.parse(addrResponse)
		// // console.log(JSON.stringify(addrResponse, null, 4))

		// var requestURL = 'https://testnet-api.smartbit.com.au/v1/blockchain/address/'
		// 				 + addressArr.join(',') + '/wallet';
		// var queryParameters = {  limit: 1000 };
		// var walletResponse = await request({url: requestURL, qs: queryParameters})
		// walletResponse = JSON.parse(walletResponse)

		// var requestURL = 'https://testnet-api.smartbit.com.au/v1/blockchain/address/'
		// 				 + addressArr.join(',') + '/unspent';
		// var queryParameters = {  limit: 1000 };
		// var unspentResponse = await request({url: requestURL, qs: queryParameters})
		// unspentResponse = JSON.parse(unspentResponse)

		// /* get total balance of all addresses (rounded to appropriate decimal) */
		// accountData.balance = floorBalance(walletResponse.wallet.total.balance_int/100000000); // convert to BTC

		// var addrResponseAddrArray = [];
		// if('addresses' in addrResponse){
		// 	addrResponseAddrArray = addrResponse.addresses;
		// }else{
		// 	addrResponseAddrArray.push(addrResponse.address);
		// }
		// addrResponseAddrArray.forEach(addrInfo => {
		// 	/* find the balance, number of tx's, and set 'used' to true if the address has transactions */
		// 	var addrData = accountData.addresses.filter(function(account) {
		// 	    return account.address === addrInfo.address;
		// 	})[0];
		// 	if(addrInfo.total.transaction_count === 0){
		// 		var index = addressArr.indexOf(addrInfo.address);
		// 		if (index !== -1) addressArr.splice(index, 1);
		// 		return;
		// 	}
		// 	addrData.balance = addrInfo.total.balance_int/100000000; // convert to BTC
		// 	addrData.numOfTx = addrInfo.total.transaction_count
		// 	addrData.used = true
		// 	/* reset utxs so we are always checking for new ones, while old ones get removed */
		// 	addrData.utxs = [];
		// 	addrData.unconfirmedTxs = [];
		// 	addrData.unconfirmedTxTotalBalance = 0;

		// 	/* find every transaction for each address */
		// 	unspentResponse.unspent.forEach(utxo => {
		// 		if(addrInfo.address === utxo.addresses[0]){
		// 			tempUtxDict = {}
		// 			tempUtxDict['n'] = utxo.n;
		// 			tempUtxDict['script'] = utxo.script_pub_key.hex;
		// 			tempUtxDict['txIndex'] = utxo.id;
		// 			tempUtxDict['txHash'] = utxo.txid;
		// 			tempUtxDict['confirmations'] = utxo.confirmations;
		// 			tempUtxDict['value'] = utxo.value_int/100000000; //convert to btc
		// 			addrData.utxs.push(tempUtxDict)
		// 			if(utxo.confirmations < 3){
		// 				var indexOfUnconfirmedTx = addrData.utxs.findIndex(x => x.txIndex === utxo.txIndex)
		// 				/* just a check to make sure the index was found */
		// 				if (indexOfUnconfirmedTx !== -1) {
		// 					/* push unconfirmed UTXO onto unconfirmed TX list */
		// 					addrData.unconfirmedTxs.push(addrData.utxs[indexOfUnconfirmedTx])

		// 					/* add the value of each unconfirmed UTXO to a total */
		// 					addrData.unconfirmedTxTotalBalance += utxoFromDb.value;

		// 					/* remove the unconfirmed UTXO from the UTXO list */
		// 				 	addrData.utxs.splice(indexOfUnconfirmedTx, 1);
		// 				}else{
		// 					throw 'Index of unconfirmed transaction not found'
		// 				}
		// 			}
		// 		}
		// 	})
		// })

		// /* COLLECT ALL TRANSACTIONS */
		// var balance = 0;
		// /* loop through each transaction */
		// walletResponse.wallet.transactions.reverse().forEach(tx => {
		// 	/* check if the TX in the response already exists in our wallet */
		// 	txExists = accountData.txs.find(obj => {
		// 	  return obj.id === tx.txid;
		// 	})

		// 	/* if it already exists check if the date and time are defined */
		// 	if(txExists){
		// 		if(!txExists.date || !txExists.time){
		// 			txExists.date = moment.unix(tx.time).format("MM/DD/YYYY")
		// 			txExists.time = moment.unix(tx.time).format("hh:mm:ss a")
		// 		}
		// 	/* else the tx does not exist, so add it */
		// 	}else{
		// 		tempTxDict = {}
		// 		tempTxDict['hash'] = tx.hash;
		// 		tempTxDict['unix'] = tx.time;
		// 		tempTxDict['date'] = moment.unix(tx.time).format("MM/DD/YYYY");
		// 		tempTxDict['time'] = moment.unix(tx.time).format("hh:mm:ss a");
		// 		/* smartbit API does not include the transaction result, so this function will make it */
		// 		var txResult = getTxResult(tx, walletResponse.wallet.addresses)/100000000; // convert to btc
		// 		balance += txResult;
		// 		tempTxDict['result'] = txResult;
		// 		tempTxDict['balance'] = balance.toFixed(8);
		// 		tempTxDict['id'] = tx.txid;
		// 		accountData.txs.push(tempTxDict)
		// 	}
		// })
		// /* sort tx's */
		// sortTxs(accountData.txs)


		/* ----- EVERYTHING BELOW IS FOR BLOCKCHAIN.INFO API ----- */

		/* make a request that gets info on every address */
		var requestURL = 'https://testnet.blockchain.info/multiaddr'
		var queryParameters = {  active: addressArr.join('|') };
		var response = await request({url: requestURL, qs: queryParameters})
		response = JSON.parse(response)
		// console.log(JSON.stringify(response, null, 4))

		/* get total balance of all addresses (rounded to appropriate decimal) */
		accountData.balance = floorBalance(response.wallet.final_balance/100000000);

		/* COLLECT ALL UTXO'S */
		response.addresses.forEach(e => {
			/* find the balance, number of tx's, and set 'used' to true if the address has transactions */
			var addrData = accountData.addresses.filter(function(account) {
			    return account.address === e.address;
			})[0];
			if(e.n_tx === 0){
				var index = addressArr.indexOf(e.address);
				if (index !== -1) addressArr.splice(index, 1);
				return;
			}
			addrData.balance = e.final_balance/100000000;
			addrData.numOfTx = e.n_tx
			addrData.used = true
			/* reset utxs so we are always checking for new ones, while old ones get removed */
			addrData.utxs = [];
			addrData.unconfirmedTxs = [];
			addrData.unconfirmedTxTotalBalance = 0;

			/* find every transaction for each address */
			response.txs.forEach(tx => {
				/* look through every output tx that matches the current address to find it's UTXO's */
				tx.out.forEach(output => {
					if(e.address === output.addr && output.spent === false){
						tempUtxDict = {}
						tempUtxDict['n'] = output.n
						tempUtxDict['script'] = output.script
						tempUtxDict['txIndex'] = output.tx_index
						addrData.utxs.push(tempUtxDict)
					}
				})
			})
		})

		/* COLLECT ALL TRANSACTIONS */
		/* loop through each transaction */
		response.txs.forEach(tx => {
			/* check if the TX in the response already exists in our wallet */
			txExists = accountData.txs.find(obj => {
			  return obj.id === tx.tx_index
			})

			/* if it already exists check if the date and time are defined */
			if(txExists){
				if(!txExists.date || !txExists.time){
					txExists.date = moment.unix(tx.time).format("MM/DD/YYYY")
					txExists.time = moment.unix(tx.time).format("hh:mm:ss a")
				}
			/* else the tx does not exist, so add it */
			}else{
				tempTxDict = {}
				tempTxDict['hash'] = tx.hash;
				tempTxDict['unix'] = tx.time;
				tempTxDict['date'] = moment.unix(tx.time).format("MM/DD/YYYY");
				tempTxDict['time'] = moment.unix(tx.time).format("hh:mm:ss a");
				tempTxDict['balance'] = tx.balance/100000000; //convert to btc
				tempTxDict['result'] = tx.result/100000000; //convert to btc
				tempTxDict['id'] = tx.tx_index;
				accountData.txs.push(tempTxDict)
			}
		})
		/* sort tx's */
		sortTxs(accountData.txs)

		/* make a request to blockchain.info for all UTXO's */
		requestURL = 'https://testnet.blockchain.info/unspent'
		queryParameters = { confirmations: 0, 
							active: addressArr.join('|')};
		var response = await request({url: requestURL, qs: queryParameters, timeout: 5000})
		response = JSON.parse(response)

		/* ADD SOME MISSING VALUES TO UTXO'S */
		addressArr.forEach(e => {
			/* get the data for each address in addressArr */
			var addrData = accountData.addresses.filter(function(account) {
				    return account.address === e;
				})[0]
			/* look through every UTXO that was returned in the response */
			response.unspent_outputs.forEach(utxoFromResponse => {
				/* look through each of the tx's in each address we have stored */
				addrData.utxs.forEach(utxoFromDb => {
					/* if the tx index's match then we add the tx hash to each tx */
					if(utxoFromResponse.tx_index === utxoFromDb.txIndex){
						utxoFromDb['txHash'] = utxoFromResponse.tx_hash_big_endian;
						utxoFromDb['confirmations'] = utxoFromResponse.confirmations;
						utxoFromDb['value'] = utxoFromResponse.value/100000000; //convert to btc

						/* if there is an unconfirmed transaction (anything less than 3 confirmations),
							we will remove that UTXO from the list and add 1 to the unconfirmedTX counter  */
						if(utxoFromDb.confirmations < 3){
							var indexOfUnconfirmedTx = addrData.utxs.findIndex(x => x.txIndex === utxoFromDb.txIndex)
							/* just a check to make sure the index was found */
							if (indexOfUnconfirmedTx !== -1) {
								/* push unconfirmed UTXO onto unconfirmed TX list */
								addrData.unconfirmedTxs.push(addrData.utxs[indexOfUnconfirmedTx])

								/* add the value of each unconfirmed UTXO to a total */
								addrData.unconfirmedTxTotalBalance += utxoFromDb.value;

								/* remove the unconfirmed UTXO from the UTXO list */
							 	addrData.utxs.splice(indexOfUnconfirmedTx, 1);
							}else{
								throw 'Index of unconfirmed transaction not found'
							}
						}
					}
				})
			});
		})
		// console.log(JSON.stringify(accountData, null, 4))
		// console.log(JSON.stringify(accountArray, null, 4))
		accountData.time = moment().unix()
		return res.json(accountData)
	} catch (e){
		/* if no free outputs found, return accountData */
		if(e.statusCode === 500 && e.error === 'No free outputs to spend'){
			accountData.time = moment().unix()
			res.json(accountData)
		}else{
			console.log(e)
			return res.status(500).json(e)
		}
	}
});

router.post('/sendTx', txValidation,  async (req, res) => {
	try{
		var accountData = accountArray.filter(function(account) {
		    return account.id === req.body.id;
		})[0];

		let tx = new bitcoin.TransactionBuilder(testnet)

		var amountWeHave = req.body.addressData.balance*100000000 // convert to satoshi
	    var amountToSend = Math.round(req.body.amount*100000000) // convert to satoshi
	    var transactionFee = req.body.fee

	    var amountToKeep = amountWeHave - amountToSend - transactionFee
	    // if(amountToKeep > 0){
	    // 	console.log('change address created')
	    // 	var accountData = createAddress(req.body.idx, true)
	    // }

		/* add an input for every UTXO */
		var inputCount = 0;
		req.body.addressData.utxs.forEach(utxo => {
			tx.addInput(utxo.txHash, utxo.n);
			inputCount += 1;
		})

		// for(var i = 0; i < 10; i++){
		// 	tx.addInput(req.body.addressData.utxs[i].txHash, req.body.addressData.utxs[i].n);
		// 	inputCount += 1;
		// }

		tx.addOutput(req.body.address, amountToSend)

		/* if amountToKeep is greater than 0, create a change address */
		if(amountToKeep > 0){
			/* For demonstration purposes, send excess funds for these addresses back to themselves */
			if(req.body.addressData.address === "mx97R1ymecapsDH8t7jVNH9henf8vxzuGD" || req.body.addressData.address === "mp8hL5KPhy71XU8Q1HfaYtJYJHcBMciFKN"){
				tx.addOutput(req.body.addressData.address, amountToKeep);
			}else{
				/* Check if there are any unused change addresses available */
				var unusedChangeAddresses = accountData.addresses.filter(account => account.used === false && account.change === true)
				if(unusedChangeAddresses.length === 0){
					/* create change address */
					accountData = await createAddress(req.body.id, true)
					console.log('change address created');
					/* get a list of all unused change addresses */
					unusedChangeAddresses = accountData.addresses.filter(account => account.used === false && account.change === true)
					/* find the first change address and  */
					tx.addOutput(unusedChangeAddresses[0].address, amountToKeep)
				}else{
					tx.addOutput(unusedChangeAddresses[0].address, amountToKeep)
				}
			}
		}

		if(FPGA){
			/* Create incomplete TXHEX to be signed by FPGA */
			var txHex = tx.buildIncomplete().toHex()
			var script = bitcoin.address.toOutputScript(req.body.addressData.address, testnet).toString('hex')
			var pubAddr = req.body.addressData.address;

			var payload = 'sign:' + txHex + ':' + script + ':' + pubAddr + ':' + inputCount;
			// console.log(payload);
			// Send payload to FPGA
			await sendDataToUSB(outEndpoint, payload);

			// Receive transaction hex from FPGA
			var response = await receiveDataFromUSB(inEndpoint);

			console.log("received: " + response.trim())
			var signedTxHex = response.trim();

			// broadcast transaction
			var wasTxBroadcasted = await broadcastTx(signedTxHex);
			return res.json(wasTxBroadcasted)
			// return res.json(true);
		}else{

		}

		// return res.json('done')

	}catch(e){
		console.log(e)
		return res.status(500).json(e)
	}
});

function getMissingMinAccountIdx(){
	/* Algorithm that finds missing index
		example:
			if there are 3 accounts and a user deletes account 2,
			the next account that should be created is account 2 */
	accountIdx = accountArray.length + 1;
	arrayOfIdx = [0]
	accountArray.forEach(e =>{
		arrayOfIdx.push(e.id)
	})
	arrayOfIdx = arrayOfIdx.sort()
	var mia = arrayOfIdx.reduce(function(acc, cur, ind, arr) {
	  var diff = cur - arr[ind-1];
	  if (diff > 1) {
	    var i = 1;
	    while (i < diff) {
	      acc.push(arr[ind-1]+i);
	      i++;
	    }
	  }
	  return acc;
	}, []);
	if(Math.min(mia)){
		return accountIdx = Math.min(mia)
	}else{
		return accountIdx
	}
}

async function createAddress(id, change){
	try{
		var accountData = accountArray.filter(function(account) {
		    return account.id === id;
		})[0];

		const unusedAddresses = accountData.addresses.filter(account => account['used'] === false);

		/* if 0 unused addresses found or a change address needs to be created, create it*/
		if (unusedAddresses.length === 0 || change){
			var tempAddressDict = {}

			if(change){
				var keyPath = 'm/44h/1h/' + (accountData.id-1) + 'h/1/' + accountData.nextChangeIdx
				tempAddressDict['change'] = true
				accountData.nextChangeIdx += 1
			}else{
				var keyPath = 'm/44h/1h/' + (accountData.id-1) + 'h/0/' + accountData.nextAddrIdx
				tempAddressDict['change'] = false
				accountData.nextAddrIdx += 1
			}
			tempAddressDict['keypath'] = keyPath

			/* TALK TO FPGA and get Address for this keypath */
			// var payload = 'keypath:' + keyPath;
			// /* any other account we will only need to retrieve the address that the FPGA creates */
			// await sendDataToUSB(outEndpoint, payload);

			// var response = await receiveDataFromUSB(inEndpoint);

			// console.log("received: " + response)
			// // address should be recieved
			// var address = response.trim();

			const keyPair = bitcoin.ECPair.makeRandom({ network: testnet })
			const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet })

			tempAddressDict['address'] = address;
			tempAddressDict['balance'] = 0;
			tempAddressDict['numOfTx'] = 0;
			tempAddressDict['used'] = false;
			tempAddressDict['utxs'] = [];
			tempAddressDict['id'] = accountData.addresses.length;
			tempAddressDict['unconfirmedTxs'] = [];
			tempAddressDict['unconfirmedTxTotalBalance'] = 0;


			accountData['addresses'].push(tempAddressDict)
		}else{
			console.log('no address created, because there is already an unused address available')
		}
		return accountData

	}catch(e){
		console.log(e)
	}
}

/* floor the balance depending on the number of decimals to display nicely on front end */
function floorBalance(finalBalance){
	var finalBalanceBtc = (finalBalance).toString()
	if(finalBalanceBtc.indexOf('.') > -1){
		var balArr = finalBalanceBtc.split('.')
		var dec = Number('0.' + balArr[1])
		var m = -Math.floor( Math.log(dec) / Math.log(10) + 1)+1;
		/* if m is anything less than 2, floor to 2 decimal places */
		if(m <= 2){
			var flooredBalanceBtc = Math.floor(finalBalanceBtc*100)/100
			return flooredBalanceBtc
		/* else floor to appropriate decimal */
		}else{
			var flooredBalanceBtc = Math.floor(finalBalanceBtc * Number("1" + ('0').repeat(m))) / Number("1" + ('0').repeat(m))
			return flooredBalanceBtc
		}
	}else{
		return Number(finalBalanceBtc) 
	}
}

/* sort the TX array so that the newest tx's are at the top of the list */
function sortTxs(unsortedTxs) {
    unsortedTxs.sort((a,b) => {
    	return b.unix - a.unix;
    })
}

function checkUSBAttach(){
	usb.on('attach', function(device) {
		/* check if FPGA device was connected */
		FPGAdevice = usb.findByIds(0x10c4, 0xea60);
		isDeviceConnected = checkDeviceConnection(device);
	});
}

function checkUSBDetach(){
	usb.on('detach', function(device) {
		/* Check that the device that disconnected was the FPGA device */
		if(FPGAdevice && (device.deviceAddress === FPGAdevice.deviceAddress)){
			/* safely close USB device */
			FPGAdevice.close();
			isDeviceConnected = false;
		}	
	})
}

function checkDeviceConnection(device){
	/* FPGA vid and pid */
	//VENDOR ID: 0x10c4
	//PRODUCT ID: 0xea60
	if(!device) return false;

	/* Check if the device connected is the FPGA device */
	if(FPGAdevice && (device.deviceAddress === FPGAdevice.deviceAddress)){
		FPGAdevice.open((err)=>{
			console.log(err);
		});
		/* There must be an interface to interact with the device,
		   So if there are no interfaces we return false */
		if(FPGAdevice.interfaces.length === 0){
			console.log("no interfaces found, retry")
			return false;
		}
		var devInterface = FPGAdevice.interfaces[0];
		devInterface.claim();

		var endpoints = FPGAdevice.interfaces[0].endpoints;
		inEndpoint = endpoints[0];
		outEndpoint = endpoints[1];
		return true;
	}
	return false;
}

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	})
}

async function sendDataToUSB(outEndpoint, payload){
	var chunks = payload.match(/.{1,1000}/g);
	for(var i = 0; i < chunks.length; i++){
		console.log(chunks[i]);
		await sendUSB(outEndpoint, chunks[i]);
		if(chunks.length > 1) await sleep(500);
	}
	await sendUSB(outEndpoint, '\n');
}

function sendUSB(outEndpoint, chunk){
	return new Promise((resolve, reject) => {
		outEndpoint.transfer(new Buffer.from(chunk), function (err) {
			if(err) throw err
			resolve(true);
		});
    });
}

function pollUSB(inEndpoint){
	return new Promise((resolve, reject) => {
		inEndpoint.transfer(1000, (error, data) => {
			if(error !== undefined) reject(error)
			/* resolve promise if data was retreived */
			// console.log(data.toString('utf8'));
			resolve(data.toString('utf8'));
		});
    });
}

async function receiveDataFromUSB(inEndpoint){
	var response = await pollUSB(inEndpoint);
	/* sometimes we don't get all the data from the usb, so we need to keep receiving data until
		we hit a new line char 
	*/
	while(response[response.length-1] !== '\n'){
		response = response + await pollUSB(inEndpoint);
	}
	return response;
}

function getTxResult(tx, addresses){
	var result = 0;
	tx.outputs.forEach(output => {
		var addrMatch = addresses.find(addr => {
			return addr === output.addresses[0];
		})
		if(addrMatch){
			result += output.value_int;
		}
	})
	tx.inputs.forEach(input => {
		var addrMatch = addresses.find(addr => {
			return addr === input.addresses[0];
		})
		if(addrMatch){
			result -= input.value_int;
		}
	})
	return result;
}

async function broadcastTx(txHex){
	try{
		var options = {
		    method: 'POST',
		    uri: 'https://api.blockcypher.com/v1/btc/test3/txs/push',
		    body: {
		        tx: txHex
		    },
		    json: true // Automatically stringifies the body to JSON
		};
		// requestURL = 'https://api.blockcypher.com/v1/btc/test3/txs/push'
		// queryParameters = { tx: txHex };
		var response = await request(options)
		// response = JSON.parse(response)
		console.log(response)
		return true;
	}catch(e){
		console.log(e)
		return false;
	}
}

module.exports = router;