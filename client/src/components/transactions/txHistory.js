import React, { Component } from 'react';
// const uuidv4 = require('uuid/v4');
// var moment = require('moment');
// const ws = new WebSocket('wss://ws.blockchain.info/inv');
// import '../../App.css';

class TxHistory extends Component {
    constructor(props) {
        super(props);
        
        this.curAccountData = null;
        this.addresses = null;
        this.txs = null;

        this.ws = null;
        this.openSocket = false;

        this.addressArrCache = [];

        this.count = 0;
    }

    /* returns a promise with the websocket once a connection has been made */
    setupWebSocket = () => {
        return new Promise((resolve, reject) => {
            var ws = new WebSocket('wss://testnet-ws.smartbit.com.au/v1/blockchain');
            ws.onopen = () => {
                resolve(ws);
            };
            ws.onerror = function(err) {
                reject(err);
            };
        });
    }

    async componentDidUpdate(prevProps, prevState, snapshot){
        try{
            if(Object.keys(this.props.accountData).length !== 0 && this.props.accountData.constructor === Object){
                this.curAccountData = this.props.accountData
                this.addresses = this.curAccountData.addresses
                this.txs = this.curAccountData.txs

                /* Open websocket if it is not already open */
                if(!this.openSocket){
                    this.ws = await this.setupWebSocket()
                    this.openSocket = true
                }

                /* if resetNewTxCount is true that means the user clicked the transaction tab,
                    so we need to reset the notification counter*/
                if(this.props.resetNewTxCount) {
                    this.props.resetFeedback(false)
                    this.count = 0;
                }

                /* create an array of all the addresses */
                var addressArr = []
                this.addresses.forEach(addressesData =>{
                    addressArr.push(addressesData.address)
                })

                /* if the address array's are not equal, it means new addresses have been added */
                if(!this.arrayEquality(addressArr, this.addressArrCache)){
                    this.addressArrCache = addressArr
                    this.subscribeToAddressChannels(addressArr)
                }
            }
        }catch(e){
            console.log(e)
        }
    }

    subscribeToAddressChannels = (addresses) => {
        if(this.openSocket){
            /* open a channel for each address */
            addresses.forEach(address => {
                this.ws.send(JSON.stringify({type: "address", address: address}));
            })
        }

        /* if any channel sends a message, it will be received here */
        this.ws.onmessage = (event) => {
            var txEvent = JSON.parse(event.data)
            if(txEvent.type === "subscribe-response") console.log(txEvent)
            /* if we get an address event, create a notification on the TX tab */
            if(txEvent.type === 'address'){
                this.count += 1
                this.props.newTx(this.count, this.curAccountData.id)
            }
            /* DEBUG */
            // console.log(txEvent)
            // if(txEvent.type !== "subscribe-response"){
            //     this.count += 1
            //     this.props.newTx(this.count, this.curAccountData.id)
            // }
        }
    }

    /* checks for array equality */
    arrayEquality = (arr1, arr2) => {
        if(arr1.length !== arr2.length)
            return false;
        for(var i = arr1.length; i--;) {
            if(arr1[i] !== arr2[i])
                return false;
        }
        return true;
    }

    componentWillUnmount(){
        /* close websocket connection */
        if(this.openSocket){
            this.ws.close();
            this.openSocket = false;
        }
    }

    render() {
        if(this.curAccountData === null) return null;
        if(this.txs.length !== 0){
            return (
                <table className="table table-striped table-sm table-responsive table-hover table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th id="time-table-head" scope="col">Time</th>
                            <th id="hash-table-head" scope="col">Transaction Hash</th>
                            <th id="amount-table-head" scope="col">Amount (₿)</th>
                            <th id="amount-table-balance" scope="col">Balance (₿)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.txs.map(tx => 
                            <tr key={tx.id}>
                                <td>{tx.date} {tx.time}</td>
                                <td><a href={"https://live.blockcypher.com/btc-testnet/tx/" + tx.hash} rel="noopener noreferrer" target="_blank">{tx.hash}</a></td>
                                <td className={tx.result < 0 ? "text-danger" : "text-success"}>{tx.result}</td>
                                <td>{tx.balance}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            ); 
        }else{
             return(
                <span>
                    There are currently 0 transactions for this account!
                </span>
            );
        }
    }
}

export default TxHistory;