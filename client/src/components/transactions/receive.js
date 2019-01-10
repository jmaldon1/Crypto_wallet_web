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
        this.setState({ curAccount: nextProps.accountData });
        const unusedAddress = nextProps.accountData['addresses'].filter(account => account['used'] === false);
        this.setState({value: unusedAddress[0].address})
        /* must set to false every time or else it will break */
        this.setState({copied: false})
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
             <div>
                <figure className="highlight">
                    <pre>
                        {this.state.value}
                    </pre>
                    <CopyToClipboard text={this.state.value}
                        onCopy={() => this.setState({copied: true})}>
                        <button type="button" className="btn btn-primary btn-sm">Copy</button>
                    </CopyToClipboard>
                </figure>

                {this.state.copied ? this.notify()  : null}
            </div>
        );
    }
}

export default ReceiveTx;