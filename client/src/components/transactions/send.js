import React, { Component } from 'react';

class SendTx extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addresses: [],
            sendAddress: '',
            amount: 0
        }
        
        this.handleAddrChange = this.handleAddrChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const unusedAddress = nextProps.accountData.addresses.filter(account => account.used === true && account.balance !== 0);
        this.setState({addresses: unusedAddress})
    }

    handleAddrChange(event) {
        /* constantly adds input values to state (good for validation of input) */
        this.setState({sendAddress: event.target.value});
    }

    handleAmountChange(event) {
        /* constantly adds input values to state (good for validation of input) */
        this.setState({amount: event.target.value});
    }

    render() {
        if(this.state.addresses.length !== 0){
            return (
                <div className="row">
                    <div className="col-5">
                        <div className="list-group" id="list-tab" role="tablist">
                        {this.state.addresses.map(address => 
                            <a key={address.id} className="list-group-item list-group-item-action" id={"list-" + address.id + "-list" } data-toggle="list" href={"#list-" + address.id} role="tab" aria-controls={address.id} >{address.address}</a>
                        )}
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="tab-content" id="nav-tabContent">
                        {this.state.addresses.map(address => 
                            <div key={address.id} className="tab-pane fade" id={"list-" + address.id} role="tabpanel" aria-labelledby={"list-" + address.id + "-list" }>
                                <span>
                                    Balance: {address.balance}
                                </span>
                                {/*<label htmlFor="basic-url">Your vanity URL</label>*/}
                                <div className="input-group mb-3">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text" id="basic-addon3">Address</span>
                                  </div>
                                  <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" value={this.state.value} onChange={this.handleChange} />
                                </div>

                                <div className="input-group mb-3">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text">Amount</span>
                                  </div>
                                  <input type="text" className="form-control" aria-label="Amount (to the nearest dollar)" value={this.state.value} onChange={this.handleChange}/>
                                  <div className="input-group-append">
                                    <span className="input-group-text">₿ (BTC)</span>
                                  </div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            );
        }else{
            return(
                <span>
                There are currently 0 spendable addresses!
                </span>
            );
        }
    }
}

export default SendTx;