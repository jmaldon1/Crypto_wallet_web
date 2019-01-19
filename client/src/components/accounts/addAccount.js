import React, { Component } from 'react';

class AddAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };

    }

    handleChange = (event) => {
        /* constantly adds input values to state (good for validation of input) */
        this.setState({value: event.target.value});
    }

    handleSubmit = (event) => {
        /* Sends data to parent component */
        this.props.onNameSelect(this.state.value);
        /* clears input box after submit */
        this.setState({value: ''})
        /* prevents page refresh */
        event.preventDefault();
    }

    render() {
        return (
            <div className="col-5">
                <form onSubmit={this.handleSubmit}>
                    <label htmlFor="add-account">Account Name</label>
                    <div className="input-group mb-3">
                        <input  type="text" 
                                id="add-account" 
                                className="form-control" 
                                placeholder={'Account #' + this.props.nextAccountFromParent} 
                                value={this.state.value} 
                                onChange={this.handleChange} 
                                aria-label="Create account name" 
                                aria-describedby="basic-addon2" />
                        <div className="input-group-append">
                            <button className="btn btn-outline-secondary" type="submit">Create</button>
                        </div>
                    </div>
                </form>
          </div>
        );
    }
}

export default AddAccount;