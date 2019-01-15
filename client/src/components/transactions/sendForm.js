import React, { Component } from 'react';
var bitcoin = require('bitcoinjs-lib');
var testnet = bitcoin.networks.testnet

class SendForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curAccountData: {},
            curAddressData: {},
            sendAddress: '',
            amount: 0,
            fee: 1000,
            maxSpendableBalance: 0,
            formErrors: {sendAddress: '', amount: ''},
            sendAddressValid: false,
            amountValid: false,
            addClassValidationAddress: '',
            addClassValidationAmount: '',
            formValid: false
        }

        this.handleUserInput = this.handleUserInput.bind(this);
        this.setMaxSpendableBalance = this.setMaxSpendableBalance.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({maxSpendableBalance: nextProps.maxSpendableBalance})
    }
    
    componentDidMount(){
        this.setState({curAddressData: this.props.addressData})
        this.setState({curAccountData: this.props.accountData})
    };

    getMaxSpendableBalance = (addressData) => {
        var amountWeHave = addressData.balance*100000000 //convert to satoshi
        var transactionFee = this.state.fee 

        var maxSpendableBalance = (amountWeHave - transactionFee)/100000000 //convert to btc

        this.setState({maxSpendableBalance: maxSpendableBalance})
        return maxSpendableBalance
    }

    handleUserInput (e, addressData) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({[name]: value}, 
                    () => { this.validateField(name, value, addressData) });
    }

    validateField(fieldName, value, addressData) {
        let fieldValidationErrors = this.state.formErrors;
        let sendAddressValid = this.state.sendAddressValid;
        let amountValid = this.state.amountValid;
        var amountValidDict = {}

        switch(fieldName) {
            case 'sendAddress':
                sendAddressValid = this.validateAddress(value)
                fieldValidationErrors.sendAddress = (sendAddressValid ? '' : 'Please Provide a valid Bitcoin testnet address');
                break;
            case 'fee':
                amountValidDict = this.validateAmount(this.state.amount, addressData)
                amountValid = amountValidDict.validBool
                fieldValidationErrors.amount = (amountValid ? '': amountValidDict.msg)
                break;
            case 'amount':
                amountValidDict = this.validateAmount(value, addressData)
                amountValid = amountValidDict.validBool
                fieldValidationErrors.amount = (amountValid ? '': amountValidDict.msg)
                break;
            default:
                break;
        }
        this.setState({ formErrors: fieldValidationErrors,
                        sendAddressValid: sendAddressValid,
                        amountValid: amountValid,
                        addClassValidationAddress: (sendAddressValid ? ' is-valid' : ' is-invalid'),
                        addClassValidationAmount: (amountValid ? ' is-valid' : ' is-invalid')
                    }, this.validateForm);
    }

    validateForm = () => {
        this.setState({formValid: this.state.sendAddressValid && this.state.amountValid});
    }

    handleSubmit(event, addressData) {
        /* prevents page refresh */
        event.preventDefault();
        /* if the form is not valid, do nothing */
        if(!this.state.formValid) return;

        /* send submit data to parent component */
        this.props.onSendTx(this.state.sendAddress, addressData, this.state.amount, this.state.fee, this.state.curAccountData.id);

        /* clears input box after submit and all validation */
        this.setState({ sendAddress: '', 
                        amount: 0, 
                        sendAddressValid: false,
                        amountValid: false,
                        addClassValidationAddress: '',
                        addClassValidationAmount: '',
                        formValid: false })
    }

    validateAddress = (address) => {
        try {
            bitcoin.address.toOutputScript(address, testnet)
            return true
        } catch (e) {
            return false
        }
    }

    validateAmount = (amount, addressData) => {
        var amountWeHave = addressData.balance*100000000 // convert to satoshi
        var amountToSend = Math.round(amount*100000000) // convert to satoshi
        var transactionFee = this.state.fee 

        var amountToKeep = amountWeHave - amountToSend - transactionFee

        this.getMaxSpendableBalance(addressData)

        var msg = ''
        if(amount <= 0){
            msg = 'Amount must be greater than 0'
            return {validBool: false, msg: msg}
        }else if (amountToKeep < 0){
            msg = 'Amount too large, (You must incorporate miners fee)'
            return {validBool: false, msg: msg}
        }else if(amountToSend <= transactionFee){
            msg = 'Amount must be greater than the fee'
            return {validBool: false, msg: msg}
        }else{
            return {validBool: true, msg: ''}
        }
    }

    setMaxSpendableBalance (addressData) {
        this.setState({amount: this.state.maxSpendableBalance})
        this.validateField('amount', this.state.maxSpendableBalance, addressData)
    }

    render() {
        return(
            <div className="tab-pane fade" id={"list-" + this.state.curAddressData.id} role="tabpanel" aria-labelledby={"list-" + this.state.curAddressData.id + "-list" }>
                <span>
                    Balance: {this.state.curAddressData.balance} ₿ (BTC)
                </span>
                {/*<label htmlFor="basic-url">Your vanity URL</label>*/}
                <form onSubmit={(e) => this.handleSubmit(e, this.state.curAddressData)}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id={"basic-addon3-"+ this.state.curAddressData.id}>Address</span>
                        </div>
                        <input name="sendAddress" type="text" className={"form-control" + this.state.addClassValidationAddress} required aria-describedby={"basic-addon3-"+ this.state.curAddressData.id} value={this.state.sendAddress} onChange={(e) => this.handleUserInput(e, this.state.curAddressData)} />
                        <div className="invalid-feedback">
                            {this.state.formErrors.sendAddress}
                        </div>
                    </div>

                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Amount</span>
                        </div>
                        <input name="amount" type="number" step="0.00000001" min="0" max={this.state.maxSpendableBalance} className={"form-control" + this.state.addClassValidationAmount} required value={this.state.amount} onChange={(e) => this.handleUserInput(e, this.state.curAddressData)} />
                        <div className="input-group-append">
                            <button className="btn btn-outline-secondary" onClick={() => this.setMaxSpendableBalance(this.state.curAddressData)} type="button" title="Maximum Amount"><i className="fa fa-arrow-up" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div className="input-group-append">
                            <span className="input-group-text">₿ (BTC)</span>
                        </div>
                        <div className="invalid-feedback">
                            {this.state.formErrors.amount}
                        </div>
                    </div>

                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label className="input-group-text" htmlFor={"inputGroupSelect-" + this.state.curAddressData.id}>Fee</label>
                        </div>
                        <select name="fee" onChange={(e) => this.handleUserInput(e, this.state.curAddressData)} className="custom-select" id={"inputGroupSelect-" + this.state.curAddressData.id}>
                            <option defaultValue value="1000">Low (1000 Satoshi)</option>
                            <option value="5000">Medium (5000 Satoshi)</option>
                            <option value="10000">High (10000 Satoshi)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-secondary float-right">Send Transaction</button>
                </form>
            </div>
        );
    }
}

export default SendForm;