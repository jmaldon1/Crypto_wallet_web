import React, { Component } from 'react';

class DeleteAccount extends Component {
    constructor(props) {
        super(props);

        this.deleteAccount = this.deleteAccount.bind(this);
    }

    deleteAccount(e) {
        (async () => {
            const rawResponse = await fetch('http://localhost:5000/wallet/deleteAccount', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'idx': this.props.idxOfAccount})
            });
            const accounts = await rawResponse.json();

            this.props.onDelete(accounts)
        })();
    }

    render() {
        return (
            <div className="row">
                <button type="button" className="btn btn-danger" onClick={this.deleteAccount}>Delete Acount</button>
            </div>
        );
    }
}

export default DeleteAccount;