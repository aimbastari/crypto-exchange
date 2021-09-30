import React, { Component } from "react";
import getWeb3 from "../getWeb3";
import Token from '../contracts/Token.json';

import "./App.css";

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      totalSupply: 0
    }
  }
  
  async componentDidMount(){
    
    const web3 = await getWeb3();
    
    const networkType = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    console.log('Accounts: ', accounts);
    console.log('Network: ', networkType);
    
    //networkId
    const networkId = await web3.eth.net.getId();
    console.log('NetworkId: ', networkId);
    const networks = Token.networks;
    console.log('network data', networks[networkId]);
    
    const address = networks[networkId].address;
    console.log('address', address);
    
    
    console.log('Token', Token);
    console.log('abi', Token.abi);
    
    const token = new web3.eth.Contract(Token.abi, address);
    console.log('token', token);
    
    const totalSupply = await token.methods.totalSupply().call();
    console.log('totalSupply', totalSupply);
    
    this.setState({totalSupply: totalSupply });
  }


  render() {
    return (
        <div>      
          <h1> hello exchange!!! </h1>
          <p>TOTAL Supply: </p><span>{this.state.totalSupply} </span>
        </div>
      );

    
  }
}

export default App;
