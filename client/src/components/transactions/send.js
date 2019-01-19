import React, { Component } from 'react';
import SendForm from './sendForm.js'
import '../../App.css';

class SendTx extends Component {
    constructor(props) {
        super(props);

        this.curAccountData = null;
        this.spendableAddresses = null;
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if((Object.keys(this.props.accountData).length !== 0 && this.props.accountData.constructor === Object) || (Object.keys(this.props.accountData).length === 0 && this.props.accountData.constructor === Object && Object.keys(prevProps.accountData).length === 0 && prevProps.accountData.constructor === Object)){
            this.curAccountData = this.props.accountData;
            this.spendableAddresses = this.curAccountData.addresses.filter(account => account.used === true && account.balance);
        }
    }

    /* pass data along to parent */
    sendTx = (address, addressData, amount, fee, id) => {
       this.props.onSendTx(address, addressData, amount, fee, id)
    }

    render() {
        if(this.curAccountData !== null){
            var unlockIcon = <i class="fa fa-unlock" aria-hidden="true"></i>
            if(this.spendableAddresses.length !== 0){
                return (
                    <div className="row">
                        <div className="col-5">
                            <div className="list-group" id="list-tab" role="tablist">
                            {this.spendableAddresses.map(address => 
                                <span key={address.id}>
                                    {address.unconfirmedTxs ? address.unconfirmedTxs : ''}
                                </span>
                            )}
                            {this.spendableAddresses.map(address =>
                                address.unconfirmedTxs && address.utxs.length === 0 ? (
                                        <span>{address.unconfirmedTxs + 'Unconfirmed Transactions'} </span>
                                    ) : (
                                         <a  key={address.id}
                                            className="list-group-item list-group-item-action wrap" 
                                            id={"list-" + address.id + "-list" } 
                                            data-toggle="list" 
                                            href={"#list-" + address.id} 
                                            role="tab" 
                                            style={{"textAlign": "center"}} 
                                            aria-controls={address.id}>
                                                {address.address} <br/> 
                                                <span className="bold">{address.balance} ₿ (BTC) <br/> 
                                                    <span>{address.unconfirmedTxs ? address.unconfirmedTxs + 'unconfirmed transactions' : ''}</span>
                                                </span>
                                        </a>
                                    )
                            )}
                            </div>
                        </div>
                        <div className="col-5">
                            <div className="tab-content" id="nav-tabContent">
                            {this.spendableAddresses.map(address => 
                                <SendForm   key={address.id} 
                                            addressData={address} 
                                            accountData={this.curAccountData} 
                                            onSendTx={this.sendTx} />
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
        }else{
            return(
                <div></div>
                )
        }
    }
}

export default SendTx;