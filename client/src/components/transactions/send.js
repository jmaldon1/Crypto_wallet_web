import React, { Component } from 'react';
import SendForm from './sendForm.js'

class SendTx extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curAccountData: {},
            addresses: [],
            fee: 1000,
            maxSpendableBalance: 0,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({curAccountData: nextProps.accountData})
        const unusedAddress = nextProps.accountData.addresses.filter(account => account.used === true && account.balance);
        this.setState({addresses: unusedAddress})
    }

    sendTx = (address, addressData, amount, fee, id) => {
       this.props.onSendTx(address, addressData, amount, fee, id)
    }


    getMaxSpendableBalance = (addressData) => {
        var amountWeHave = addressData.balance*100000000 //convert to satoshi
        var transactionFee = this.state.fee 

        var maxSpendableBalance = (amountWeHave - transactionFee)/100000000 //convert to btc

        this.setState({maxSpendableBalance: maxSpendableBalance})
        return maxSpendableBalance
    }

    render() {
        if(this.state.addresses.length !== 0){
            return (
                <div className="row">
                    <div className="col-5">
                        <div className="list-group" id="list-tab" role="tablist">
                        {this.state.addresses.map(address => 
                            <a key={address.id} onClick={() => this.getMaxSpendableBalance(address)} className="list-group-item list-group-item-action" id={"list-" + address.id + "-list" } data-toggle="list" href={"#list-" + address.id} role="tab" style={{"textAlign": "center"}} aria-controls={address.id} >{address.address} <br/><span>{address.balance} ₿ (BTC)</span></a>
                        )}
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="tab-content" id="nav-tabContent">
                        {this.state.addresses.map(address => 
                            <SendForm key={address.id} addressData={address} accountData={this.state.curAccountData} onSendTx={this.sendTx} maxSpendableBalance={this.state.maxSpendableBalance} />
                        )}
                        </div>
                    </div>
                </div>
            );
        }else{
            return(
                <span>
                There are currently 0 spendable addresses!
                </span>
            );
        }
    }
}

export default SendTx;