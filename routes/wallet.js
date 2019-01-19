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
const FPGA = true

// var accountArray = [];
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
                "unconfirmedTxs": 0,
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
                "unconfirmedTxs": 0,
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
                "unconfirmedTxs": 0,
                "id": 2
            },
            {
                "keypath": "m/44h/1h/0h/1/0",
                "address": "mp8hL5KPhy71XU8Q1HfaYtJYJHcBMciFKN",
                "numOfTx": 0,
                "balance" : 0,
                "utxs": [],
                "used": false,
                "change": true,
                "unconfirmedTxs": 0,
                "id": 3
            }
        ],
        "id": 1,
        "name": "Account #1",
        "balance": 0,
        "txs": [],
        "defaultAccount": true,
        "nextAddrIdx": 3,
        "nextChangeIdx": 1,
    }
    // {
    //     "addresses": [
    //         {
    //             "keypath": "m/44h/0h/1h/0/0",
    //             "address": "2NAZ2GVgh1BQvQQeC5GwoKj4v4bk4K2wqgR",
    //             "used": false
    //         }
    //     ],
    //     "id": 2,
    //     "name": "Account #2",
    //     "defaultAccount": false
    // },
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

router.get('/accounts', async (req, res) => {
	try{
		var nextAccount = getMissingMinAccountIdx()
		return res.json({"accounts": accountArray, "nextAccount": nextAccount});
	}catch(e){
		console.log(e)
		return res.status(400).json(e)
	}
});

router.post("/addAccount", async (req, res) => {
	try{
		accountIdx = getMissingMinAccountIdx();
		
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
		tempAccountDict['unconfirmedTxs'] = 0
		
		/* TALK TO FPGA */
		const keyPair = bitcoin.ECPair.makeRandom({ network: testnet })
		const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet })
		tempAddressDict['address'] = address

		tempAccountDict['addresses'].push(tempAddressDict)

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
		var accountData = createAddress(req.body.idx, req.body.change)

		// console.log(JSON.stringify(accountArray, null, 4))
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
			return res.json(accountData)
		}

		/* make a request that gets info on every address */
		var requestURL = 'https://testnet.blockchain.info/multiaddr'
		var queryParameters = {  active: addressArr.join('|') };
		var response = await request({url: requestURL, qs: queryParameters, timeout: 5000})
		response = JSON.parse(response)
		// console.log(JSON.stringify(response, null, 4))

		/* get total balance of all addresses (rounded to appropriate decimal) */
		accountData.balance = floorBalance(response.wallet.final_balance/100000000);

		/* loop through each address */
		response.addresses.forEach(e => {
			/* find the balance, number of tx's, and sets 'used' to true if the address has transactions */
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
			/* find every transaction for each address */
			response.txs.forEach(tx => {
				txExists = accountData.txs.find(obj => {
				  return obj.hash === tx.hash
				})
				if(!txExists){
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
				}
			})
		})

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

		/* loop through each address in addressArr */
		addressArr.forEach(e => {
			/* get the data for each address in addressArr */
			var addrData = accountData.addresses.filter(function(account) {
				    return account.address === e;
				})[0]
			addrData.unconfirmedTxs = 0
			/* look through every UTXO that was returned in the response */
			response.unspent_outputs.forEach(utxoFromResponse => {
				/* look through each of the tx's in each address we have stored */
				addrData.utxs.forEach(utxoFromDb => {
					/* if the tx index's match then we add the tx hash to each tx */
					if(utxoFromResponse.tx_index === utxoFromDb.txIndex){
						utxoFromDb['txHash'] = utxoFromResponse.tx_hash_big_endian
						utxoFromDb['confirmations'] = utxoFromResponse.confirmations
						/* if there is an unconfirmed transaction (anything less than 3 confirmations),
							we will remove that UTXO from the list and add 1 to the unconfirmedTX counter  */
						if(utxoFromDb.confirmations < 3){
							var indexOfUnconfirmedTx = addrData.utxs.findIndex(x => x.txIndex === utxoFromDb.txIndex)
							/* just a check to make sure the index was found */
							if (indexOfUnconfirmedTx > -1) {
							 	addrData.utxs.splice(indexOfUnconfirmedTx, 1);
							 	addrData.unconfirmedTxs += 1
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
		return res.json(accountData)
	} catch (e){
		/* if no free outputs found, return accountData */
		if(e.statusCode === 500 && e.error === 'No free outputs to spend'){
			res.json(accountData)
		}else{
			return res.status(500).json(e)
		}
	}
});

router.post('/sendTx', txValidation,  async (req, res) => {
	try{
		let tx = new bitcoin.TransactionBuilder(testnet)

		var amountWeHave = req.body.addressData.balance*100000000 // convert to satoshi
	    var amountToSend = Math.round(req.body.amount*100000000) // convert to satoshi
	    var transactionFee = req.body.fee

	    var amountToKeep = amountWeHave - amountToSend - transactionFee
	    if(amountToKeep > 0){
	    	console.log('change address created')
	    	var accountData = createAddress(req.body.idx, true)
	    }

	 //    requestURL = 'https://testnet.blockchain.info/unspent'
		// queryParameters = { confirmations: 0, 
		// 					active: addressArr.join('|')};
		// var response = await request({url: requestURL, qs: queryParameters, timeout: 5000})
		// response = JSON.parse(response)

		/* add an input for every UTXO */
		var inputCount = 0;
		req.body.addressData.utxs.forEach(utxo => {
			tx.addInput(utxo.txHash, utxo.n);
			inputCount += 1;
		})

		tx.addOutput(req.body.address, amountToSend)

		/* if accountData exists, it means a change address was created */
		if(accountData){
			const unusedChangeAddresses = accountData.addresses.filter(account => account.used === false && account.change === true)
			tx.addOutput(unusedChangeAddresses[0], amountTokeep)
		}

		if(FPGA){
			// CREATES INCOMPLETE TX TO BE SIGNED LATER
			let tx_hex = tx.buildIncomplete().toHex()

			let script = bitcoin.address.toOutputScript(req.body.addressData.address, testnet)

			// // tx_hex and script WILL BE SENT BACK TO FPGA
			console.log('tx_hex: ' + tx_hex)
			console.log('script: ' + script.toString('hex'))
		}else{

		}

		return res.json('done')

	}catch(e){
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

function createAddress(id, change){
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

		/* TALK TO FPGA and get Address for this keypath */
		tempAddressDict['keypath'] = keyPath
		const keyPair = bitcoin.ECPair.makeRandom({ network: testnet })
		const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet })

		tempAddressDict['address'] = address
		tempAddressDict['balance'] = 0
		tempAddressDict['numOfTx'] = 0;
		tempAddressDict['used'] = false
		tempAddressDict['utxs'] = []
		tempAddressDict['id'] = accountData.addresses.length
		accountData['addresses'].push(tempAddressDict)
	}else{
		console.log('no address created, because there is already an unused address available')
	}
	return accountData
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
			var flooredBalanceBtc = Math.floor(finalBalanceBtc * Number("1" + ('0').repeat(2))) / Number("1" + ('0').repeat(2))
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

module.exports = router;