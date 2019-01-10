import React, { Component } from 'react';

class AddAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        /* constantly adds input values to state (good for validation of input) */
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        /* Sends data to parent component */
        this.props.onNameSelect(this.state.value);
        /* clears input box after submit */
        this.setState({value: ''})
        /* prevents page refresh */
        event.preventDefault();
    }

    render() {
        return (
          <form onSubmit={this.handleSubmit}>
            <label>
              Account Name:
              <input type="text" placeholder={'Account #' + this.props.nextAccountFromParent} value={this.state.value} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        );
    }
}

export default AddAccount;