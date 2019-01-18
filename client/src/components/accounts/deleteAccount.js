import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class DeleteAccount extends Component {
    constructor(props) {
        super(props);

        this.deleteAccount = this.deleteAccount.bind(this);
        this.status = {};
    }

    notify = (status) => {
        if(status.type === 'success'){
            toast.success(status.msg, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }else if(status.type === 'error'){
            toast.error(status.msg, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };

    async deleteAccount(e) {
        try{
            const rawResponse = await fetch('http://localhost:5000/wallet/deleteAccount', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'idx': this.props.idxOfAccount})
            });
            if (rawResponse.status !== 200) throw await rawResponse
            await rawResponse.json();
            this.status['type'] = 'success'
            this.status['msg'] = 'Account deleted!'
            this.notify(this.status)
            this.props.onDelete()

        }catch(error){
            console.log(error)
            this.status['type'] = 'error'
            this.status['msg'] = await error.json()
            this.notify(this.status)
        }
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