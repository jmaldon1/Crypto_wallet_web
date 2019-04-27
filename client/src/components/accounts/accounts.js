import React, { Component } from 'react';
import AddAccount from './addAccount.js'
import EachAccount from './eachAccount.js'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import './App.css';

class Accounts extends Component {
    constructor(props){
        super(props);
        this.state = {
          accounts: [],
          nextAccount: 0,
          getBalanceFromId: null,
          makeContentActiveFromId: null,
          deviceConnection: null,
          loading: false,
          successfullTx: null
        }
    };

    componentDidMount(){
        /* Get all the users accounts when the component is loaded */
        fetch('http://localhost:5000/wallet/accounts')
        .then(res => res.json())
        .then(results => {
            this.setState({accounts: results.accounts, nextAccount: results.nextAccount}, () => console.log('Results: ', results))
        });

        /* Check if the FPGA device is connected when the component is loaded */
        fetch('http://localhost:5000/wallet/usbConnect')
        .then(res => res.json())
        .then(results => {
            this.setState({deviceConnection: results.deviceConnection})
        });
    };

    checkDeviceConnection = async () => {
        try{
            fetch('http://localhost:5000/wallet/usbConnect')
            .then(res => res.json())
            .then(results => {
                if(!this.state.deviceConnection && results.deviceConnection){
                    toast.success("Device has been connected!", {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true
                    });
                }else if(this.state.deviceConnection && !results.deviceConnection){
                    toast.error("Device has been disconnected!", {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true
                    });
                }else if(!this.state.deviceConnection){
                    toast.warn("Please connect FPGA device!", {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true
                    });
                }
                this.setState({deviceConnection: results.deviceConnection})
            });
        }catch(e){
            console.log(e)
        }
    };

    /* Get data from addAccount child component */
    handleName = async (name) => {
        /* POST request */
        try{
            if(!this.state.deviceConnection){
                toast.error("Error: Device must be connected!", {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                return false;
            }
            this.toggleLoading(); //toggle a loading screen so the user cannot click anything
            const rawResponse = await fetch('http://localhost:5000/wallet/addAccount', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'name': name})
            });
            if (rawResponse.status !== 200) throw await rawResponse
            const results = await rawResponse.json();
            this.toggleLoading();

            var newAccountId = this.state.nextAccount
            this.setState({accounts: results.accounts, nextAccount: results.nextAccount, makeContentActiveFromId: newAccountId})

            /* Make 'Add Account' tab inactive */
            var tab = document.getElementById("v-pills-addAccount-tab");
            tab.classList.remove('active')
            var tabContent = document.getElementById("v-pills-addAccount");
            tabContent.classList.remove('active', 'show')

            /* Make newly added account tab active */
            var newAccountTab = document.getElementById("v-pills-" + newAccountId + "-tab");
            newAccountTab.classList.add("active");

            return true;

        }catch (e){
            console.log(e)
            // console.log('status ' + e.status + ': ' + await e.json())
        }
    };

    /* Send a transaction */
    sendTx = async (address, addressData, amount, fee, id) => {
        /* POST request */
        try{
            if(!this.state.deviceConnection){
                toast.error("Error: Device must be connected!", {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                return false;
            }
            this.toggleLoading();
            const rawResponse = await fetch('http://localhost:5000/wallet/sendTx', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({  'address': address,
                                    'amount': amount,
                                    'fee': fee,
                                    'id': id,
                                    'addressData': addressData })
            });
            if (rawResponse.status !== 200) throw await rawResponse
            const results = await rawResponse.json();
            this.toggleLoading();
            // console.log(results)
            if(results === true){
                toast.success("Transaction Sent! ✓ ", {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
                // this.setState({successfullTx: true});
                // await this.sleep(3500);
                // this.setState({successfullTx: false});
                // return true;
            }else{
                return false;
            }
        }catch (e){
            console.log(e)
        }
    };

    sleep = (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        })
    };

    /* When an account tab is clicked, tell the child to check its balance */
    tabClick = (account) => {
        this.setState({getBalanceFromId: account.id})
    };

    /* GET updated account data */
    updateAccounts = () => {
        fetch('http://localhost:5000/wallet/accounts')
        .then(res => res.json())
        .then(results => this.setState({accounts: results.accounts, nextAccount: results.nextAccount}));
    };

    toggleLoading = () => {
        if(this.state.loading){
            this.setState({
                loading: false
            })
        }else{
            this.setState({
                loading: true
            })
        }
    };

    render() {
        var loadingScreen;
        var successfullTxIcon;
        if(this.state.loading){
            loadingScreen = <div className="overlay">
                                <img className="loader" src={require("../../public/loader.gif")} alt="Loading"/>
                            </div>
        }else{
            loadingScreen = null;
        }

        if(this.state.successfullTx){
            successfullTxIcon  = <img className="successIcon" src={require("../../public/successTxIcon.png")} alt="Transaction Successfully Sent"/>
        }else{
            successfullTxIcon = null;
        }
        return (
            <div className="row">
                <div className="col-sm-2">
                    <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                        <button id="deviceConnection" onClick={() => { this.checkDeviceConnection() }}  className={this.state.deviceConnection ? "alert alert-success" : "alert alert-danger"} role="alert">
                            {this.state.deviceConnection ? "Device Connected " : "Device Disconnected "}
                        </button>
                        {this.state.accounts.map(account =>
                            <a  key={account.id} onClick={() => { this.tabClick(account) }} 
                                className={account.defaultAccount === true ? "nav-link active" : "nav-link"} 
                                id={"v-pills-" + account.id + "-tab"} 
                                data-toggle="pill" 
                                href={"#v-pills-" + account.id} 
                                role="tab" 
                                aria-controls={"v-pills-" + account.id} 
                                aria-selected={account.defaultAccount === true ? "true" : "false"}>{account.name} <br/> 
                                    <span className="bold">{account.balance} ₿</span>
                            </a> 
                        )}
                        <a className="nav-link" id="v-pills-addAccount-tab" data-toggle="pill" href="#v-pills-addAccount" role="tab" aria-controls="v-pills-addAccount" aria-selected="false"><i className="fa fa-plus" aria-hidden="true"></i>
                        Add Account</a>
                    </div>
                </div>
                <div className="col">

                    <div className="tab-content" id="v-pills-tabContent">
                       {this.state.accounts.map(account =>
                           <EachAccount key={account.id} 
                                        curAccountData={account} 
                                        onDefault={this.updateAccounts} 
                                        onDelete={this.updateAccounts} 
                                        onSendTx={this.sendTx} 
                                        updateBalanceFromId={this.state.getBalanceFromId} 
                                        makeContentActiveFromId={this.state.makeContentActiveFromId}
                                        updateAccounts={this.updateAccounts} 
                                        toggleLoading={this.toggleLoading} />
                        )}
                        <div className="tab-pane fade" id="v-pills-addAccount" role="tabpanel" aria-labelledby="v-pills-addAccount-tab">
                            <nav>
                                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                    <a className="nav-item nav-link active" id="nav-add-tab" data-toggle="tab" href="#nav-add" role="tab" aria-controls="nav-add" aria-selected="true">Add</a>
                                </div>
                            </nav>
                            <div className="tab-content" id="nav-tabContent">
                                <div className="tab-pane fade show active" id="nav-add" role="tabpanel" aria-labelledby="nav-add-tab">
                                    <AddAccount 
                                        onNameSelect={this.handleName} 
                                        nextAccountFromParent={this.state.nextAccount} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {loadingScreen}
                {successfullTxIcon}
            </div>
        );
    }
}

export default Accounts;
