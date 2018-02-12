import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    loading: false
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async event => {
    event.preventDefault();

    if (this.state.value <= 0.01) {
      this.setState({ message: 'Entry must exceed 0.01 ether.' });
      return;
    }

    const accounts = await web3.eth.getAccounts();

    this.setState({ loading: true });
    this.setState({
      message: 'This may take up to a minute. Waiting on transaction success...'
    });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered!' });
    this.setState({ value: '' });

    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
    this.setState({ loading: false });
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ loading: true });
    this.setState({
      message: 'This may take up to a minute. Waiting on transaction success...'
    });

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked!' });

    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
    this.setState({ loading: false });
  };

  render() {
    return (
      <div>
        <h2>Ether Lottery on Rinkeby</h2>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people entered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        <p>This is a test network. Do NOT send real ether.</p>
        <ul>
          <li>You must have MetaMask installed.</li>
          <li>You must accept the funds transfer when prompted.</li>
        </ul>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <label>Amount of ether to enter</label>
          <input
            type="number"
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value })}
          />
          <button disabled={this.state.loading}>Enter</button>
        </form>
        <hr />
        <h4>Ready to pick a winner?</h4>
        <button
          onClick={this.onClick}
          disabled={this.state.loading || !this.state.players.length}
        >
          Pick a Winner!
        </button>
        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
