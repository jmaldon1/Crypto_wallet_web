import React, { Component } from 'react';
import DeleteAccount from './deleteAccount.js'
import DefaultAccount from './defaultAccount.js'
import SendTx from '../transactions/send.js'
import ReceiveTx from '../transactions/receive.js'

class EachAccounts extends Component {
    constructor(props){
        super(props);
        this.state = {
          curAccountData: {}
        }
    }

    /* Get all the users accounts when the component is loaded */
    componentDidMount(){
        this.setState({curAccountData: this.props.curAccountData})
        this.getBalances(this.props.curAccountData.id)
    };

    componentWillReceiveProps(nextProps) {
        // console.log('here')
        // console.log(nextProps.updateBalanceId)
        // if(nextProps.updateBalanceId){
        //     this.getBalances(nextProps.updateBalanceId)
        // }
    };

    sendTx = (address, addressData, amount, fee, id) => {
       this.props.onSendTx(address, addressData, amount, fee, id)
    }

    getBalances = (id) => {
         (async () => {
            try{
                const rawResponse = await fetch('http://localhost:5000/wallet/checkBalance', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({'idx': id})
                });
                if (rawResponse.status !== 200) throw await rawResponse
                const results = await rawResponse.json();

                /* if there are no unused addresses, create one */
                if(results.addresses.filter(account => account.used === false && account.change === false).length === 0){
                    this.getNewAddress(id, false)
                }else{
                    this.setState({curAccountData: results})
                }
            }catch (e){
                console.log('status ' + e.status + ': ' + await e.json())
            }
        })();
    }

    /* creates a new address that is meant to receive coins */
    getNewAddress = (id, change) => {
        (async () => {
            try{
                const rawResponse = await fetch('http://localhost:5000/wallet/createAddress', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({  'idx': id,
                                        'change': change })
                });
                if (rawResponse.status !== 200) throw await rawResponse
                const results = await rawResponse.json();
                this.setState({curAccountData: results})
            }catch (e){
                console.log('status ' + e.status + ': ' + await e.json())
            }
        })();
    }

    passDefault = () => {
        this.props.onDefault()
    }

    passDelete = () => {
        this.props.onDelete()
    }

    render() {
        if(this.state.curAccountData.defaultAccount === true){
            return(
                <div className="tab-pane fade show active" id={"v-pills-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"v-pills-" + this.state.curAccountData.id + "-tab"}>
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <a className="nav-item nav-link active" id={"nav-send-tab-id-" + this.state.curAccountData.id} data-toggle="tab" href={"#nav-send-id-" + this.state.curAccountData.id} role="tab" aria-controls={"#nav-send-id-" + this.state.curAccountData.id} aria-selected="true"><i className="fa fa-arrow-circle-up" aria-hidden="true"></i>
                        Send</a>
                        <a className="nav-item nav-link" id={"nav-receive-tab-id-" + this.state.curAccountData.id} data-toggle="tab" href={"#nav-receive-id-" + this.state.curAccountData.id} role="tab" aria-controls={"#nav-receive-id-" + this.state.curAccountData.id} aria-selected="false"><i className="fa fa-arrow-circle-down" aria-hidden="true"></i>
                        Receive</a>
                        <a className="nav-item nav-link" id={"nav-settings-tab-id-" + this.state.curAccountData.id} data-toggle="tab" href={"#nav-settings-id-" + this.state.curAccountData.id} role="tab" aria-controls={"#nav-settings-id-" + this.state.curAccountData.id} aria-selected="false"><i className="fa fa-cog" aria-hidden="true"></i>
                        Settings</a>
                      </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className="tab-pane fade show active" id={"nav-send-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-send-tab-id-" + this.state.curAccountData.id}>
                            <SendTx accountData={this.state.curAccountData} onSendTx={this.sendTx} />
                        </div>
                        <div className="tab-pane fade" id={"nav-receive-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-receive-tab-id-" + this.state.curAccountData.id}>
                            <ReceiveTx accountData={this.state.curAccountData} />
                        </div>
                        <div className="tab-pane fade" id={"nav-settings-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-settings-tab-id-" + this.state.curAccountData.id}>
                            <DefaultAccount onDefault={this.passDefault} idxOfAccount={this.state.curAccountData.id}/>
                            <DeleteAccount onDelete={this.passDelete} idxOfAccount={this.state.curAccountData.id}/>
                        </div>
                    </div>
                </div>
            )
        }else{
            return(
                <div className="tab-pane fade" id={"v-pills-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"v-pills-" + this.state.curAccountData.id + "-tab"}>
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <a className="nav-item nav-link active" id={"nav-send-tab-id-" + this.state.curAccountData.id} data-toggle="tab" href={"#nav-send-id-" + this.state.curAccountData.id} role="tab" aria-controls={"#nav-send-id-" + this.state.curAccountData.id} aria-selected="true"><i className="fa fa-arrow-circle-up" aria-hidden="true"></i>
                        Send</a>
                        <a className="nav-item nav-link" id={"nav-receive-tab-id-" + this.state.curAccountData.id} data-toggle="tab" href={"#nav-receive-id-" + this.state.curAccountData.id} role="tab" aria-controls={"#nav-receive-id-" + this.state.curAccountData.id} aria-selected="false"><i className="fa fa-arrow-circle-down" aria-hidden="true"></i>
                        Receive</a>
                        <a className="nav-item nav-link" id={"nav-settings-tab-id-" + this.state.curAccountData.id} data-toggle="tab" href={"#nav-settings-id-" + this.state.curAccountData.id} role="tab" aria-controls={"#nav-settings-id-" + this.state.curAccountData.id} aria-selected="false"><i className="fa fa-cog" aria-hidden="true"></i>
                        Settings</a>
                      </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className="tab-pane fade show active" id={"nav-send-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-send-tab-id-" + this.state.curAccountData.id}>
                            <SendTx accountData={this.state.curAccountData} onSendTx={this.sendTx} />
                        </div>
                        <div className="tab-pane fade" id={"nav-receive-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-receive-tab-id-" + this.state.curAccountData.id}>
                            <ReceiveTx accountData={this.state.curAccountData} />
                        </div>
                        <div className="tab-pane fade" id={"nav-settings-id-" + this.state.curAccountData.id} role="tabpanel" aria-labelledby={"nav-settings-tab-id-" + this.state.curAccountData.id}>
                            <DefaultAccount onDefault={this.passDefault} idxOfAccount={this.state.curAccountData.id}/>
                            <DeleteAccount onDelete={this.passDelete} idxOfAccount={this.state.curAccountData.id}/>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default EachAccounts;
