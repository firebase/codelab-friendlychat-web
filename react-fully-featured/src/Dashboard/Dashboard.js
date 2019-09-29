import React, { useState, useContext } from 'react';
import DashChannels from './DashChannels.js';
import Users from '../Traffic/Users.js';
import Traffic from '../Traffic/Traffic.js';
import Modal from '../Modal/Modal.js';
import './Dashboard.css';

const Dashboard = props => {

  // const sessionContext = useContext(SessionContext);
  // const { userConfig } = sessionContext.state;

  const { history, location } = props;
  const potatoDashStore = localStorage.getItem('potatoDashStore');
  const [mode, setMode] = useState(potatoDashStore || 'CHANNELS');

  const handleNav = mode => {
    switch(mode) {
  		case null:
        return history.goBack();
  		case 'USERS':
        localStorage.setItem('potatoDashStore', mode);
        return setMode(mode);
      case 'CHANNELS':
        localStorage.setItem('potatoDashStore', mode);
        return setMode(mode);
      case 'TRAFFIC':
        localStorage.setItem('potatoDashStore', mode);
        return setMode(mode);
  		default:
        localStorage.setItem('potatoDashStore', 'CHANNELS');
        return setMode('CHANNELS');
  	}
  }

  return (
    <section className="dashboardComponent">
      <header>
        <h4>{location.pathname}</h4>
      </header>
      <section className="exit">
        <button className="exitButton"
          onClick={() => handleNav(null)}>
          <i className="material-icons">clear</i>
        </button>
      </section>
      <main className="dashboardContent">
        {mode === 'USERS' ? <Users /> : null}
        {mode === 'CHANNELS' ? <DashChannels /> : null}
        {mode === 'TRAFFIC' ? <Traffic /> : null}
      </main>
      <footer className="dashboardNav">
        <button className="navToUsers"
          onClick={() => handleNav('USERS')}>
          <div>
            <i className="material-icons">people</i>
            <p>people</p>
          </div>
        </button>
        <button className="navToChannels"
          onClick={() => handleNav('CHANNELS')}>
          <div>
            <i className="material-icons">room</i>
            <p>channels</p>
          </div>
        </button>
        <button className="navToTraffic"
          onClick={() => handleNav('TRAFFIC')}>
          <div>
            <i className="material-icons">public</i>
            <p>traffic</p>
          </div>
        </button>
      </footer>
    </section>
  );
}

export default Dashboard;
