import React, { Component } from 'react';

class SendTx extends Component {
    constructor(props) {
        super(props);
        this.state = {
            UTXO: []
        }
        
        this.defaultAccount = this.defaultAccount.bind(this);
    }

    defaultAccount(e) {
        (async () => {
            const rawResponse = await fetch('http://localhost:5000/wallet/defaultAccount', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'idx': this.props.idxOfAccount})
            });
            const accounts = await rawResponse.json();
            alert('Default Account Set')

            this.props.onDefault(accounts)
        })();
    }

    render() {
        return (
            <div className="row">
              <div className="col-4">
                <div className="list-group" id="list-tab" role="tablist">
                  <a className="list-group-item list-group-item-action active" id="list-home-list" data-toggle="list" href="#list-home" role="tab" aria-controls="home">Home</a>
                  <a className="list-group-item list-group-item-action" id="list-profile-list" data-toggle="list" href="#list-profile" role="tab" aria-controls="profile">Profile</a>
                  <a className="list-group-item list-group-item-action" id="list-messages-list" data-toggle="list" href="#list-messages" role="tab" aria-controls="messages">Messages</a>
                  <a className="list-group-item list-group-item-action" id="list-settings-list" data-toggle="list" href="#list-settings" role="tab" aria-controls="settings">Settings</a>
                </div>
              </div>
              <div className="col-8">
                <div className="tab-content" id="nav-tabContent">
                  <div className="tab-pane fade show active" id="list-home" role="tabpanel" aria-labelledby="list-home-list">...</div>
                  <div className="tab-pane fade" id="list-profile" role="tabpanel" aria-labelledby="list-profile-list">...</div>
                  <div className="tab-pane fade" id="list-messages" role="tabpanel" aria-labelledby="list-messages-list">...</div>
                  <div className="tab-pane fade" id="list-settings" role="tabpanel" aria-labelledby="list-settings-list">...</div>
                </div>
              </div>
            </div>
        );
    }
}

export default SendTx;