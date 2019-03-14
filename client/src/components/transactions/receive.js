import React, { Component } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class ReceiveTx extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            copied: false,
        };

        this.unusedAddress = null;
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        /* update unused addresses if this.props.accountData is defined OR if this.props.accountData is defined and prevProps is undefined*/
        if((Object.keys(this.props.accountData).length !== 0 && this.props.accountData.constructor === Object) || (Object.keys(this.props.accountData).length !== 0 && this.props.accountData.constructor === Object && Object.keys(prevProps.accountData).length === 0 && prevProps.accountData.constructor === Object)){
            this.unusedAddress = this.props.accountData.addresses.filter(account => account.used === false && account.change === false);
            /* check for new unused address */
            if(this.unusedAddress[0].address !== this.state.value){
                this.setState({value: this.unusedAddress[0].address, copied: false})
            }
        }
        /* must set copied back to false */
        if(this.state.copied === true){
            this.setState({copied: false})
        }
    }

    notify = () => {
        toast.info('Copied', {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    render() {
        return (
             <div className="row">
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon3">Address</span>
                    </div>
                    <input type="text" name="address" style={{width: '350px'}} aria-describedby="basic-addon3" value={this.state.value} readOnly />
                    <CopyToClipboard text={this.state.value}
                        onCopy={() => this.setState({copied: true})}>
                        <button type="button" className="btn btn-primary btn-sm">Copy</button>
                    </CopyToClipboard>
                </div>

                {this.state.copied ? this.notify()  : null}
            </div>
        );
    }
}

export default ReceiveTx;