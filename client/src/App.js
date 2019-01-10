import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
// import logo from './logo.svg';
// import './App.css';
import Accounts from './components/accounts/accounts.js'

class App extends Component {
  render() {
    return (
        <div className="App">
            <div className="container-fluid">
                <Accounts />
                <ToastContainer
					position="top-right"
					autoClose={4000}
					hideProgressBar
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnVisibilityChange
					draggable
					pauseOnHover
					/>
            </div>
      </div>
    );
  }
}

export default App;
