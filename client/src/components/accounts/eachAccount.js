import React, { Component } from 'react';
import DeleteAccount from './deleteAccount.js'
import DefaultAccount from './defaultAccount.js'
import SendTx from '../transactions/send.js'
import ReceiveTx from '../transactions/receive.js'
import TxHistory from '../transactions/txHistory.js'

class EachAccounts extends Component {
    constructor(props){
        super(props);
        this.state = {
            curAccountData: {},
            newTxNotification: '',
            resetTxNotification: false
        }
    }

    /* This needs to be async because we have to wait for getBalances to update the state
        and rerender the component */
    async componentDidMount(){
        try{
            /* wait for the balances to be retrieved so the component can render with the correct data */
            await this.getBalances(this.props.curAccountData.id)

            if(this.props.makeContentActiveFromId === this.state.curAccountData.id){
                /* When a new account is created, 
                    we need to show the user the new account tab by making it active */
                var newAccountContent = document.getElementById("v-pills-" + this.state.curAccountData.id);
                newAccountContent.classList.add("active", "show");
            }
        }catch(e){
            console.log(e)
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot){
        /* when a tab is clicked on the parent component, 
            it tells this component to check the balance of the account */
        if(this.props.updateBalanceFromId !== prevProps.updateBalanceFromId && this.props.updateBalanceFromId === this.state.curAccountData.id){
            this.getBalances(this.props.updateBalanceFromId)
        }
    }

    /* check the balance of the current account */
    getBalances = async (id) => {
        try{
            const rawResponse = await fetch('http://localhost:5000/wallet/checkBalance', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'idx': id})
            });
            if (rawResponse.status !== 200) throw await rawResponse
            const results = await rawResponse.json();
            // console.log(results)

            /* if there are no unused addresses, create one */
            if(results.addresses.filter(account => account.used === false && account.change === false).length === 0){
                this.getNewAddress(id, false)
            }else{
                this.setState({curAccountData: results})
                this.props.updateAccounts();
                return true;
            }
        }catch (e){
            console.log(e)
        }
    }

    /* creates a new address that is meant to receive coins */
    getNewAddress = async (id, change) => {
        try{
            this.props.toggleLoading();
            const rawResponse = await fetch('http://localhost:5000/wallet/createAddress', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({  'idx': id,
                                    'change': change })
            });
            if (rawResponse.status !== 200) throw await rawResponse
            const results = await rawResponse.json();
            this.props.toggleLoading();

            this.setState({curAccountData: results})
            this.props.updateAccounts()
            return true;
            
        }catch (e){
            console.log(e)
        }
    }

    /* When an transaction tab is clicked, check balance of account for new transactions */
    txTabClick = (account) => {
        this.getBalances(account.id)
        /* reset TX notifications */
        this.setState({resetTxNotification: true, newTxNotification: ''})
    };

    sendTabClick = (account) => {
        this.getBalances(account.id)
    }

    /* called if a new TX is recieved */
    newTx = (count, id) => {
        var txTab = document.getElementById("nav-transactions-id-" + this.state.curAccountData.id)
        /* if the TX tab is inactive, create notifications */
        if(!txTab.classList.contains('active')){
            this.setState({newTxNotification: count})
        }
        this.getBalances(id)
    };

    /* set reset back to false once child has recieved it */
    resetFeedback = (reset) => {
        this.setState({resetTxNotification: reset})
    }

    /* pass data along to parent */
    sendTx = (address, addressData, amount, fee, id) => {
       this.props.onSendTx(address, addressData, amount, fee, id)
    }

    /* pass data along to parent */
    passDefault = () => {
        this.props.onDefault()
    }

    /* pass data along to parent */
    passDelete = () => {
        this.props.onDelete()
    }

    render() {
        return(
             <div className={this.state.curAccountData.defaultAccount === true ? "tab-pane fade show active" : "tab-pane fade show"} id={"v-pills-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"v-pills-" + this.state.curAccountData.id + "-tab"}>
                <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <a  className="nav-item nav-link" 
                            onClick={() => { this.txTabClick(this.state.curAccountData) }} 
                            id={"nav-transactions-tab-id-" + this.state.curAccountData.id} 
                            data-toggle="tab" 
                            href={"#nav-transactions-id-" + this.state.curAccountData.id} 
                            role="tab" 
                            aria-controls={"#nav-transactions-id-" + this.state.curAccountData.id} 
                            aria-selected="false">
                                <i className="fa fa-exchange" aria-hidden="true"></i>
                                Transactions 
                                <span className="badge badge-pill badge-success">{this.state.newTxNotification}</span>
                        </a>
                        <a  className="nav-item nav-link"
                            onClick={() => { this.sendTabClick(this.state.curAccountData) }}
                            id={"nav-send-tab-id-" + this.state.curAccountData.id} 
                            data-toggle="tab" 
                            href={"#nav-send-id-" + this.state.curAccountData.id} 
                            role="tab" 
                            aria-controls={"#nav-send-id-" + this.state.curAccountData.id} 
                            aria-selected="false">
                                <i className="fa fa-arrow-circle-up" aria-hidden="true"></i>
                                Send
                        </a>
                        <a  className="nav-item nav-link active" 
                            id={"nav-receive-tab-id-" + this.state.curAccountData.id} 
                            data-toggle="tab" 
                            href={"#nav-receive-id-" + this.state.curAccountData.id} 
                            role="tab" 
                            aria-controls={"#nav-receive-id-" + this.state.curAccountData.id} 
                            aria-selected="true">
                                <i className="fa fa-arrow-circle-down" aria-hidden="true"></i>
                                Receive
                        </a>
                        <a  className="nav-item nav-link" 
                            id={"nav-settings-tab-id-" + this.state.curAccountData.id} 
                            data-toggle="tab" 
                            href={"#nav-settings-id-" + this.state.curAccountData.id} 
                            role="tab" 
                            aria-controls={"#nav-settings-id-" + this.state.curAccountData.id} 
                            aria-selected="false">
                                <i className="fa fa-cog" aria-hidden="true"></i>
                                Settings
                        </a>
                    </div>
                </nav>
                <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade" id={"nav-transactions-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-transactions-tab-id-" + this.state.curAccountData.id}>
                        <TxHistory 
                            accountData={this.state.curAccountData}
                            newTx={this.newTx} 
                            resetNewTxCount={this.state.resetTxNotification} 
                            resetFeedback={this.resetFeedback} />
                    </div>
                    <div className="tab-pane fade" id={"nav-send-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-send-tab-id-" + this.state.curAccountData.id}>
                        <SendTx 
                            accountData={this.state.curAccountData} 
                            onSendTx={this.sendTx} />
                    </div>
                    <div className="tab-pane fade show active" id={"nav-receive-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-receive-tab-id-" + this.state.curAccountData.id}>
                        <ReceiveTx accountData={this.state.curAccountData} />
                    </div>
                    <div className="tab-pane fade" id={"nav-settings-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-settings-tab-id-" + this.state.curAccountData.id}>
                        <DefaultAccount 
                            onDefault={this.passDefault} 
                            idxOfAccount={this.state.curAccountData.id}/>
                        <DeleteAccount 
                            onDelete={this.passDelete} 
                            idxOfAccount={this.state.curAccountData.id}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default EachAccounts;
