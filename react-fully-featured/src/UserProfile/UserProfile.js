import React, { useEffect, useContext } from 'react';
import Modal from '../Modal/Modal.js';
import useOAuth from '../Auth/useOAuth.js';
import SessionContext from '../SessionContext.js';
import './UserProfile.css';

// https://developer.chrome.com/extensions/signedInDevices
const UserProfile = props => {

  const { history } = props;

  // const oAuth = useOAuth(false);
  const sessionContext = useContext(SessionContext);
  const { userConfig } = sessionContext.state;

  // const loadingAnimation = (
  //   <aside className="modalHeader">
  //     <button className="exitButton" onClick={() => {
  //       history.goBack();
  //     }}>
  //       <i className="material-icons clearIcon">clear</i>
  //     </button>
  //     <div className="loadingAnimation" />
  //   </aside>
  // );

  // useEffect(() => {
  //   if (isSignedOut) {
  //     history.push('/');
  //   }
  // }, [isSignedOut]);

  return (
    <Modal show={true}>
      <div className="userProfileComponent">
        <nav className="nameNav">
          <h1>update profile</h1>
        </nav>
        <nav className="buttonNav">
          <button className="exitButton" onClick={() => {
            history.goBack();
          }}>
            <i className="material-icons clearIcon">arrow_back</i>
          </button>
        </nav>
        <main className="userProfileMain">
          <button onClick={() => props.handleSignOut(userConfig)}>
            click here to sign out
          </button>
        </main>
      </div>
    </Modal>
  )
}

export default UserProfile;
