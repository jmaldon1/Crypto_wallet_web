import React, { Component } from 'react';
import AddAccount from './addAccount.js'
import EachAccount from './eachAccount.js'
// import './App.css';

class Accounts extends Component {
    constructor(props){
        super(props);
        this.state = {
          accounts: [],
          nextAccount: 0,
          getBalanceId: null
        }
        this.updateAccounts = this.updateAccounts.bind(this);
    };

    /* Get all the users accounts when the component is loaded */
    componentDidMount(){
        fetch('http://localhost:5000/wallet/accounts')
        .then(res => res.json())
        .then(results => {
            this.setState({accounts: results.accounts, nextAccount: results.nextAccount}, () => console.log('Results: ', results))
        });
    };

    /* Get data from addAccount child component */
    handleName = (name) => {
        /* POST request */
        (async () => {
            try{
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

                var newAccountId = this.state.nextAccount
                this.setState({accounts: results.accounts, nextAccount: results.nextAccount})

                /* Make newly added account tab active */
                var newAccountTab = document.getElementById("v-pills-" + newAccountId + "-tab");
                newAccountTab.classList.add("active");
                var newAccountContent = document.getElementById("v-pills-" + newAccountId);
                newAccountContent.classList.add("active", "show");
            }catch (e){
                console.log('status ' + e.status + ': ' + await e.json())
            }
        })();

        /* Make 'Add Account' tab inactive */
        var tab = document.getElementById("v-pills-addAccount-tab");
        tab.classList.remove('active')
        var tabContent = document.getElementById("v-pills-addAccount");
        tabContent.classList.remove('active', 'show')

    }

    sendTx = (address, addressData, amount, fee, id) => {
        /* POST request */
        (async () => {
            try{
                const rawResponse = await fetch('http://localhost:5000/wallet/sendTx', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({  'address': address,
                                        'amount': amount,
                                        'fee': fee,
                                        'idx': id,
                                        'addressData': addressData })
                });
                if (rawResponse.status !== 200) throw await rawResponse
                const results = await rawResponse.json();
                console.log(results)
            }catch (e){
                console.log('status ' + e.status + ': ' + await e.json())
            }
        })();
    };

    getBalance = (account) => {
        this.setState({getBalanceId: account.id})
    };

    /* make a get request to API that retrieves all current Accounts */
    updateAccounts(){
        fetch('http://localhost:5000/wallet/accounts')
        .then(res => res.json())
        .then(results => this.setState({accounts: results.accounts, nextAccount: results.nextAccount}));
    };

  render() {
    return (
        <div className="row">
            <div className="col-sm-2">
                <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                    {this.state.accounts.map(account =>
                        account.defaultAccount === true ? (
                            <a key={account.id} onClick={() => { this.getBalance(account) }} className="nav-link active" id={"v-pills-" + account.id + "-tab"} data-toggle="pill" href={"#v-pills-" + account.id} role="tab" aria-controls={"v-pills-" + account.id} aria-selected="true">{account.name}</a>
                        ) : (
                            <a key={account.id} onClick={() => { this.getBalance(account) }} className="nav-link" id={"v-pills-" + account.id + "-tab"} data-toggle="pill" href={"#v-pills-" + account.id} role="tab" aria-controls={"v-pills-" + account.id} aria-selected="false">{account.name}</a>
                        )
                )}
                <a className="nav-link" id="v-pills-addAccount-tab" data-toggle="pill" href="#v-pills-addAccount" role="tab" aria-controls="v-pills-addAccount" aria-selected="false"><i className="fa fa-plus" aria-hidden="true"></i>
                Add Account</a>
                </div>
            </div>
            <div className="col">
                <div className="tab-content" id="v-pills-tabContent">
                    {this.state.accounts.map(account =>
                       <EachAccount key={account.id} curAccountData={account} onDefault={this.updateAccounts} onDelete={this.updateAccounts} onSendTx={this.sendTx} updateBalanceId={this.state.getBalanceId} />
                    )}
                    <div className="tab-pane fade" id="v-pills-addAccount" role="tabpanel" aria-labelledby="v-pills-addAccount-tab">
                        <nav>
                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                <a className="nav-item nav-link active" id="nav-add-tab" data-toggle="tab" href="#nav-add" role="tab" aria-controls="nav-add" aria-selected="true">Add</a>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-add" role="tabpanel" aria-labelledby="nav-add-tab">
                                <AddAccount onNameSelect={this.handleName} nextAccountFromParent={this.state.nextAccount} /> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}

export default Accounts;
