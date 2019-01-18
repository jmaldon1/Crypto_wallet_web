import React, { Component } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class ReceiveTx extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curAccount: {},
            value: '',
            copied: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        // this.setState({ curAccount: nextProps.accountData });
        const unusedAddress = nextProps.accountData.addresses.filter(account => account.used === false && account.change === false);
        this.setState({value: unusedAddress[0].address, curAccount: nextProps.accountData, copied: false});
        /* must set to false every time or else it will break */
        // this.setState({copied: false})
    }

    // static getDerivedStateFromProps(nextProps, prevState){
    //     if(Object.keys(nextProps.accountData).length !== 0 && nextProps.accountData.constructor === Object){
    //         const unusedAddress = nextProps.accountData.addresses.filter(account => account.used === false && account.change === false);
    //         return{
    //             curAccount: nextProps.accountData, 
    //             value: unusedAddress[0].address,
    //             copied: false
    //         }
    //     }
    //     return {
    //         curAccount: {},
    //         value: '',
    //         copied: false
    //     }
    //     // return null;
    //     // /* must set to false every time or else it will break */
    //     // this.setState({copied: false})
    // }

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