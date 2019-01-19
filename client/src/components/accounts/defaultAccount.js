import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class DefaultAccount extends Component {
    constructor(props) {
        super(props);
        
        this.status = {};
    }

    notify = (status) => {
        if(status.type === 'success'){
            toast.info(status.msg, {
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

    defaultAccount = async (e) => {
        try{
            const rawResponse = await fetch('http://localhost:5000/wallet/defaultAccount', {
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
            this.status['msg'] = 'Default account set!'
            this.notify(this.status)
            this.props.onDefault()
            
        }catch (error){
            console.log(error)
            this.status['type'] = 'error'
            this.status['msg'] = await error.json()
            this.notify(this.status)
            // console.log('status ' + e.status + ': ' + await e.json())
        }
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