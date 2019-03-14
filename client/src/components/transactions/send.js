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
        if((Object.keys(this.props.accountData).length !== 0 && this.props.accountData.constructor === Object) || (Object.keys(this.props.accountData).length !== 0 && this.props.accountData.constructor === Object && Object.keys(prevProps.accountData).length === 0 && prevProps.accountData.constructor === Object)){
            /* if prevProps is undefined or if the time in this.props is greater than the time in prevProps */
            this.curAccountData = this.props.accountData;
            this.spendableAddresses = this.curAccountData.addresses.filter(address => address.used === true && address.balance);
        }
    }

    /* pass data along to parent */
    sendTx = (address, addressData, amount, fee, id) => {
       this.props.onSendTx(address, addressData, amount, fee, id)
    }

    render() {
        if(this.curAccountData === null) return null;
        if(this.spendableAddresses.length !== 0){
            return (
                <div className="row">
                    <div className="col-5">
                        <div className="list-group" id="list-tab" role="tablist">
                        {this.spendableAddresses.map(address =>
                            <a  key={address.id}
                                className= {address.unconfirmedTxs.length !== 0 && address.utxs.length === 0 ? "list-group-item list-group-item-action wrap disabled" : "list-group-item list-group-item-action wrap" }
                                id={"list-" + address.address + "-list" } 
                                data-toggle="list" 
                                href={"#list-" + address.address} 
                                role="tab" 
                                style={{"textAlign": "center"}} 
                                aria-controls={address.address}>
                                    {address.address} <br/> 
                                    <span className="bold"> {address.balance - address.unconfirmedTxTotalBalance} ₿ (BTC) <i className="fa fa-lock text-success" title={address.utxs.length + ' Confirmed Transactions'} aria-hidden="true"></i> <br/> 
                                        <span className={address.unconfirmedTxs.length !== 0 ? "" : "hideEle"}>
                                            {address.unconfirmedTxTotalBalance} ₿ (BTC) <i className="fa fa-unlock text-warning" title={address.unconfirmedTxs.length + ' Unconfirmed Transactions'} aria-hidden="true"></i>
                                        </span>
                                    </span>
                            </a>
                        )}
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="tab-content" id="nav-tabContent">
                        {this.spendableAddresses.map(address => 
                            address.unconfirmedTxs.length !== 0 && address.utxs.length === 0 ? ''
                            : <SendForm key={address.id} 
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
    }
}

export default SendTx;