var bitcoin = require('bitcoinjs-lib');
const testnet = bitcoin.networks.testnet

module.exports = {
    txValidation: async function(req, res, next) {  

        if(!req.body.fee){
            return res.status(400).json('Missing Fee')
        }

        if(!req.body.addressData){
            return res.status(400).json('Missing Address Data')
        }

        if(!req.body.amount){
            return res.status(400).json('Missing Amount')
        }else{
            var amountWeHave = req.body.addressData.balance*100000000 // convert to satoshi
            var amountToSend = Math.round(req.body.amount*100000000) // convert to satoshi
            var transactionFee = req.body.fee

            var amountToKeep = amountWeHave - amountToSend - transactionFee

            if(req.body.amount <= 0){
                return res.status(400).json('Amount must be greater than 0')
            }else if (amountToKeep < 0){
                return res.status(400).json('Amount too large, (You must incorporate miners fee)')
            }else if(amountToSend <= transactionFee){
                return res.status(400).json('Amount must be greater than the fee')
            }
        }

        if(!req.body.address){
            return res.status(400).json('Missing Address')
        }else{
            try {
                bitcoin.address.toOutputScript(req.body.address, testnet)
            } catch (e) {
                return res.status(400).json('Invalid bitcoin testnet address')
            }
        }

        // Pass to next layer of middleware
        return next();
    }
}