import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class DefaultAccount extends Component {
    constructor(props) {
        super(props);
        
        this.defaultAccount = this.defaultAccount.bind(this);
    }

    notify = () => {
        toast.info('Default Account Set', {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

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
            this.notify()

            this.props.onDefault()
        })();
    }

    render() {
        return (
            <div className="row">
                <button type="button" className="btn btn-primary" onClick={this.defaultAccount}>Set as default account</button>
            </div>
        );
    }
}

export default DefaultAccount;