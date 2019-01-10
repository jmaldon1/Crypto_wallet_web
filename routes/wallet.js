const express = require("express");
const router = express.Router();
var path = require('path');
var usb = require('usb');
const request = require("request-promise");
var bitcoin = require('bitcoinjs-lib');
const testnet = bitcoin.networks.testnet

// var accountArray = [];
var accountArray = [
    {
        "addresses": [
            {
                "keypath": "m/44h/0h/0h/0/0",
                "address": "mx97R1ymecapsDH8t7jVNH9henf8vxzuGD",
                "numOfTx": 0,
                "balance" : 0,
                "change": [],
                "txs": [],
                "used": false,
                "id": 0
            },
            // {
            //     "keypath": "m/44h/0h/0h/1/0",
            //     "address": "2NAZ2GVgh1BQvQQeC5GwoKj4v4bk4K2wqgR",
            //     "used": false
            // }
            {
                "keypath": "m/44h/0h/0h/2/0",
                "address": "moHSnM84HuhTRv1kzhz8LJmzEMV18rBHeR",
                "numOfTx": 0,
                "balance" : 0,
                "change": [],
                "txs": [],
                "used": false,
                "id": 2
            }
        ],
        "id": 1,
        "name": "Account #1",
        "defaultAccount": true
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
	var nextAccount = getMissingMinAccountIdx()
	return res.json({"accounts": accountArray, "nextAccount": nextAccount});
});

router.post("/addAccount", async (req, res) => {
	accountIdx = getMissingMinAccountIdx();
	var tempAccountDict = {}
	tempAccountDict = {}
	tempAccountDict['addresses'] = []

	tempAccountDict['id'] = accountIdx
	var name;
	!req.body.name ? name = 'Account #' + accountIdx : name = req.body.name;
	tempAccountDict['name'] = name


	var tempAddressDict = {}
	var keyPath = 'm/44h/0h/' + (accountIdx-1) + 'h/0/0';
	tempAddressDict['keypath'] = keyPath
	tempAddressDict['used'] = false
	tempAddressDict['balance'] = 0
	tempAddressDict['numOfTx'] = 0;
	tempAddressDict['change'] = []
	tempAddressDict['txs'] = []
	tempAddressDict['id'] = accountIdx-1
	
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
});

router.post('/deleteAccount', async (req, res) => {
	/* Use the index of account that the user wants to delete and remove it from the accountArray */
	accountArray.splice(accountArray.map(function(x) {return x.id; }).indexOf(req.body.idx), 1);
	res.json(accountArray);
});

router.post('/defaultAccount', async (req, res) => {
	/* Unsets the current default account */
	var ownerData = accountArray.filter(function(account) {
	    return account['defaultAccount'] === true;
	})[0];
	if (ownerData) ownerData['defaultAccount'] = false;

	/* Sets the new default account */
	accountArray[accountArray.map(function(x) {return x.id; }).indexOf(req.body.idx)]['defaultAccount'] = true
	return res.json(accountArray)
});

router.post('/createAddress', async (req, res) => {
	// GET IDX OF CURRENT ACCOUNT FROM POST REQUEST
	var accountData = accountArray.filter(function(account) {
	    return account['id'] === req.body.idx;
	})[0];

	const unusedAddresses = accountData['addresses'].filter(account => account['used'] === false);

	/* 0 unused addresses found */
	if (unusedAddresses.length === 0){
		var tempAddressDict = {}
		var keyPathArr = accountData.addresses[accountData.addresses.length-1].keypath.split("/")
		var x = Number(keyPathArr[keyPathArr.length-2])
		x += 1

		keyPathArr[keyPathArr.length-2] = x
		var keyPath = keyPathArr.join('/')

		/* TALK TO FPGA and get Address for this keypath */
		tempAddressDict['keypath'] = keyPath
		const keyPair = bitcoin.ECPair.makeRandom({ network: testnet })
		const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet })

		tempAddressDict['address'] = address
		tempAddressDict['balance'] = 0
		tempAddressDict['numOfTx'] = 0;
		tempAddressDict['used'] = false
		tempAddressDict['change'] = []
		tempAddressDict['txs'] = []
		accountData['addresses'].push(tempAddressDict)

	}else{
		console.log('no address created, because there is already an unused address available')
	}

	// console.log(JSON.stringify(accountArray, null, 4))
	return res.json(accountData);
});

router.post('/checkBalance', async (req, res) => {
	// if (!req.body.addresses) throw "Must Provide Addresses"
	// GET IDX OF CURRENT ACCOUNT FROM POST REQUEST
	var addressArr = []
	var tempTxDict = {}
	var accountData = accountArray.filter(function(account) {
	    return account['id'] === req.body.idx;
	})[0];

	const unusedAddresses = accountData['addresses'].filter(account => account['used'] === false);
	unusedAddresses.forEach(e => addressArr.push(e.address))

	var requestURL = 'https://testnet.blockchain.info/multiaddr'
	var queryParameters = {  active: addressArr.join('|') };
	var response = await request({url: requestURL, qs: queryParameters, timeout: 5000})
	response = JSON.parse(response)

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
			/* look through every output tx that match the current address to find it's UTXO's */
			tx.out.forEach(output => {
				if(e.address === output.addr && output.spent === false){
					tempTxDict = {}
					tempTxDict['n'] = output.n
					tempTxDict['script'] = output.script
					tempTxDict['txIndex'] = output.tx_index
					addrData.txs.push(tempTxDict)
				}
			})
		})
	})
	if(addressArr.length === 0){
		return res.json(accountData)
	}
	/* 
	txs array within each address
	[
		{
			n: 0,
			script: ...,
			tx_hash: ...,
		}
	]
	*/

	requestURL = 'https://testnet.blockchain.info/unspent'
	queryParameters = { confirmations: 0, 
						active: addressArr.join('|')};
	var response = await request({url: requestURL, qs: queryParameters, timeout: 5000})
	response = JSON.parse(response)

	/* loop through each address in addressArr */
	addressArr.forEach(e => {
		var addrData = accountData.addresses.filter(function(account) {
			    return account.address === e;
			})[0]
		/* look through every UTXO that was returned in the response */
		response.unspent_outputs.forEach(utxo => {
			/* look through each of the tx's in each address we have stores */
			addrData.txs.forEach(tx => {
				/* if the tx index's match then we add the tx hash to each tx */
				if(utxo.tx_index === tx.txIndex){
					tx['txHash'] = utxo.tx_hash
				}
			})
		});
	})
	// console.log(accountData)
	// console.log(JSON.stringify(accountArray, null, 4))
	return res.json(accountData)
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

module.exports = router;