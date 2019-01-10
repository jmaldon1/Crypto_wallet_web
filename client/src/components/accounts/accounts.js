import React, { Component } from 'react';
import AddAccount from './addAccount.js'
import DeleteAccount from './deleteAccount.js'
import DefaultAccount from './defaultAccount.js'
import SendTx from '../transactions/send.js'
// import './App.css';

class Accounts extends Component {
    constructor(props){
        super(props);
        this.state = {
          accounts: [],
          nextAccount: 0
        }
        this.updateAccounts = this.updateAccounts.bind(this);
    }

    /* Get all the users accounts when the component is loaded */
    componentDidMount(){
        fetch('http://localhost:5000/wallet/accounts')
        .then(res => res.json())
        .then(results => this.setState({accounts: results.accounts, nextAccount: results.nextAccount}, () => console.log('Results: ', results)));
    }

    /* Get data from addAccount child component */
    handleName = (name) => {
        /* POST request */
        (async () => {
            const rawResponse = await fetch('http://localhost:5000/wallet/addAccount', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'name': name})
            });
            const results = await rawResponse.json();
            // console.log(results)
            this.setState({accounts: results.accounts})
            this.setState({nextAccount: results.nextAccount})

            /* Make newly added account tab active */
            var accountId = results.accounts[results.accounts.length-1].id
            var newAccountTab = document.getElementById("v-pills-" + accountId + "-tab");
            newAccountTab.classList.add("active");
            var newAccountContent = document.getElementById("v-pills-" + accountId);
            newAccountContent.classList.add("active", "show");
        })();

        /* Make 'Add Account' tab inactive */
        var tab = document.getElementById("v-pills-addAccount-tab");
        tab.classList.remove('active')
        var tabContent = document.getElementById("v-pills-addAccount");
        tabContent.classList.remove('active', 'show')

    }

    /* make a get request to API that retrieves all current Accounts */
    updateAccounts(e){
        fetch('http://localhost:5000/wallet/accounts')
        .then(res => res.json())
        .then(results => this.setState({accounts: results.accounts, nextAccount: results.nextAccount}));
    }

  render() {
    // console.log(this.state.nextAccount)
    return (
        <div className="row">
            <div className="col-sm-2">
                <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                    {this.state.accounts.map(accounts =>
                        accounts.defaultAccount === true ? (
                            <a key={accounts.id} className="nav-link active" id={"v-pills-" + accounts.id + "-tab"} data-toggle="pill" href={"#v-pills-" + accounts.id} role="tab" aria-controls={"v-pills-" + accounts.id} aria-selected="true">{accounts.name}</a>
                        ) : (
                            <a key={accounts.id} className="nav-link" id={"v-pills-" + accounts.id + "-tab"} data-toggle="pill" href={"#v-pills-" + accounts.id} role="tab" aria-controls={"v-pills-" + accounts.id} aria-selected="false">{accounts.name}</a>
                        )
                )}
                <a className="nav-link" id="v-pills-addAccount-tab" data-toggle="pill" href="#v-pills-addAccount" role="tab" aria-controls="v-pills-addAccount" aria-selected="false"><i className="fa fa-plus" aria-hidden="true"></i>
                Add Account</a>
                </div>
            </div>
            <div className="col">
                <div className="tab-content" id="v-pills-tabContent">
                    {this.state.accounts.map(accounts =>
                        accounts.defaultAccount === true ? (
                            <div key={accounts.id} className="tab-pane fade show active" id={"v-pills-" + accounts.id} role="tabpanel" aria-labelledby={"v-pills-" + accounts.id + "-tab"}>
                                <nav>
                                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                    <a className="nav-item nav-link active" id={"nav-send-tab-id-" + accounts.id} data-toggle="tab" href={"#nav-send-id-" + accounts.id} role="tab" aria-controls={"#nav-send-id-" + accounts.id} aria-selected="true">Send</a>
                                    <a className="nav-item nav-link" id={"nav-receive-tab-id-" + accounts.id} data-toggle="tab" href={"#nav-receive-id-" + accounts.id} role="tab" aria-controls={"#nav-receive-id-" + accounts.id} aria-selected="false">Receive</a>
                                    <a className="nav-item nav-link" id={"nav-settings-tab-id-" + accounts.id} data-toggle="tab" href={"#nav-settings-id-" + accounts.id} role="tab" aria-controls={"#nav-settings-id-" + accounts.id} aria-selected="false"><i className="fa fa-cog" aria-hidden="true"></i>
                                    Settings</a>
                                  </div>
                                </nav>
                                <div className="tab-content" id="nav-tabContent">
                                    <div className="tab-pane fade show active" id={"nav-send-id-" + accounts.id} role="tabpanel" aria-labelledby={"nav-send-tab-id-" + accounts.id}>
                                        <SendTx />
                                    </div>
                                    <div className="tab-pane fade" id={"nav-receive-id-" + accounts.id} role="tabpanel" aria-labelledby={"nav-receive-tab-id-" + accounts.id}>...</div>
                                    <div className="tab-pane fade" id={"nav-settings-id-" + accounts.id} role="tabpanel" aria-labelledby={"nav-settings-tab-id-" + accounts.id}>
                                        <DefaultAccount onDefault={this.updateAccounts} idxOfAccount={accounts.id}/>
                                        <DeleteAccount onDelete={this.updateAccounts} idxOfAccount={accounts.id}/>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={accounts.id} className="tab-pane fade" id={"v-pills-" + accounts.id} role="tabpanel" aria-labelledby={"v-pills-" + accounts.id + "-tab"}>
                                <nav>
                                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                    <a className="nav-item nav-link active" id={"nav-send-tab-id-" + accounts.id} data-toggle="tab" href={"#nav-send-id-" + accounts.id} role="tab" aria-controls={"#nav-send-id-" + accounts.id} aria-selected="true">Send</a>
                                    <a className="nav-item nav-link" id={"nav-receive-tab-id-" + accounts.id} data-toggle="tab" href={"#nav-receive-id-" + accounts.id} role="tab" aria-controls={"#nav-receive-id-" + accounts.id} aria-selected="false">Receive</a>
                                    <a className="nav-item nav-link" id={"nav-settings-tab-id-" + accounts.id} data-toggle="tab" href={"#nav-settings-id-" + accounts.id} role="tab" aria-controls={"#nav-settings-id-" + accounts.id} aria-selected="false"><i className="fa fa-cog" aria-hidden="true"></i>
                                    Settings</a>
                                  </div>
                                </nav>
                                <div className="tab-content" id="nav-tabContent">
                                    <div className="tab-pane fade show active" id={"nav-send-id-" + accounts.id} role="tabpanel" aria-labelledby={"nav-send-tab-id-" + accounts.id}>
                                        <SendTx />
                                    </div>
                                    <div className="tab-pane fade" id={"nav-receive-id-" + accounts.id} role="tabpanel" aria-labelledby={"nav-receive-tab-id-" + accounts.id}>test</div>
                                    <div className="tab-pane fade" id={"nav-settings-id-" + accounts.id} role="tabpanel" aria-labelledby={"nav-settings-tab-id-" + accounts.id}>
                                        <DefaultAccount onDefault={this.updateAccounts} idxOfAccount={accounts.id}/>
                                        <DeleteAccount onDelete={this.updateAccounts} idxOfAccount={accounts.id}/>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                    <div className="tab-pane fade" id="v-pills-addAccount" role="tabpanel" aria-labelledby="v-pills-addAccount-tab">
                        <nav>
                          <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <a className="nav-item nav-link active" id="nav-add-tab" data-toggle="tab" href="#nav-add" role="tab" aria-controls="nav-add" aria-selected="true">Add</a>
                          </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-add" role="tabpanel" aria-labelledby="nav-add-tab">
                              <AddAccount onNameSelect={this.handleName} nextAccountFromParent={this.state.nextAccount}/> 
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
