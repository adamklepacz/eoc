import React, { Component } from 'react';

import ReactImage from './react.png';
import Header from './components/Header';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { username: null };
  }

  componentDidMount() {
    fetch('/api/getUsername')
      .then(res => res.json())
      .then(user => this.setState({ username: user.username }));
  }

  render() {
    const { username } = this.state;

    return (
      <div>
        <Header />
        {username ? (
          <h1>{`Hello, world, ${username}`}</h1>
        ) : (
          <h1>Loading... please wait!</h1>
        )}
        <img src={ReactImage} alt="react" />
      </div>
    );
  }
}

export default App;
