import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Chat.css';
import Messages from '../Messages/Messages.js';
import Menu from '../Menu/Menu.js';
import SubmitMessage from '../SubmitMessage/SubmitMessage.js';

class Chat extends React.Component {
  render() {
    return (
      <div className="appComponent">
        <header className="header">
          <div className="menuIconContainer">
            <Link className="displayMenu" to={`/chat/dashboard`}>
              <i className="material-icons menuIcon">sort</i>
            </Link>
            <Link className="displayPierre" to={`/chat/rooms/?rm=lastVisited`}>
              <img className="userImage"
                alt="user"
                src="https://lh3.googleusercontent.com/-42Rxl6komNU/AAAAAAAAAAI/AAAAAAAAAJ0/n2btuWyx90o/photo.jpg"
               />
            </Link>
          </div>
          <div className="appNameContainer">
            <Link to="/chat/rooms">
              <p className="headerAppName">Potato<span className="titleBeta"> beta</span></p>
            </Link>
          </div>
          <div className="headerIconContainer">
            <Link to={'/chat/userProfile'}>
              <i className="material-icons personIcon">person</i>
            </Link>
          </div>
        </header>
        <aside className="sidebar">
          <Menu />
        </aside>
        <main className="main">
          <Messages />
        </main>
      </div>
    );
  }
}

export default Chat;
