import React, { Fragment, useEffect, useState } from 'react';
import useForm from './useForm.js';
import useOAuth from './useOAuth.js';
import Modal from '../Modal/Modal.js';
import * as firebase from 'firebase';

const RegistrationForm = props => {

  const { setSelection, authEmail, handleClose, oAuthResponse, dead, setAuthEmail, isAuthLinkSent, initProvider, getOAuthProvider, linkAccounts, unLinkAccount, redirectToWaiting, needsConfirmation, updateUserDetails, authToast, authLinkUser, redirectToChat, isAuthenticated, setIsAuthenticated, redirectToAuthChat, redirectTo, isSignedOut } = props;
  const formCallback = (payload, event, clear) => {
    if (authMode.register) setAuthEmail(payload.email);
    if (authMode.newUser) {
      updateUserDetails(payload);
      redirectTo('/chat/rooms/?rm=lastVisited');
    }
    // clear({});
  };
  const { handleSubmit, handleChange, formErrors, formValues, clearForm } = useForm(formCallback);
  const { displayName, email, password } = formValues;
  const { displayNameError, emailError, passwordError } = formErrors;

  const potatoStorage = localStorage.getItem('potatoStorage');
  const [chooseAuth, setChooseAuth] = useState(true);
  const [oAuthProvider, setOauthProvider] = useState(true);
  const [dialog, setDialog] = useState('Please choose a sign in method.');
  const [newUser, setNewUser] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [shouldMerge, setShouldMerge] = useState(false);
  const [authMethods, setAuthMethods] = useState(false);
  const [verifiedInstance, setVerifiedInstance] = useState(false);
  const [targetInstance, setTargetInstance] = useState(false);
  const [authMode, setAuthMode] = useState({ register: true, action: 'send dynamic link' });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCred, setPendingCred] = useState(false);
  const [providerData, setProviderData] = useState({
    'google.com': {
      method: 'signInWithRedirect',
      name: 'Google',
      providerId: 'google.com',
      path: require('../assets/btn_google_light_focus_ios.svg')}
  });

  useEffect(() => {
    if (!dead && oAuthResponse) {
      const { code, additionalUserInfo, ...rest } = oAuthResponse;
      const isNewUser = additionalUserInfo ? additionalUserInfo.isNewUser : false;
      const initProvider = rest.credential.providerId;
      if (code === 'auth/account-exists-with-different-credential') {
        firebase.auth().fetchSignInMethodsForEmail(rest.email)
          .then(methods => {
            const oldInstance = getOAuthProvider(methods[0]);
            const newInstance = getOAuthProvider(initProvider);
            setVerifiedInstance(oldInstance);
            setTargetInstance(newInstance);
            setDialog(`Looks like you already have an account, cool! Would you like to sign in with ${methods[0]} or enable ${initProvider} services for ${rest.email}?`);
            setAuthMode({merge: true, action: 'link accounts', onClick: () => linkAccounts(methods[0], rest.credential) });
            return;
          })
          .catch(error => {
            console.log(error);
          });
      } else if (isNewUser && !isSignedOut) {
        localStorage.removeItem('potatoStorage');
        setDialog('Welcome! Create a display name and a password for extra security :)');
        setAuthMode({ newUser: true, action: 'create account'});
      } else if (!isSignedOut) {
        localStorage.removeItem('potatoStorage');
        redirectTo('/chat/rooms/?rm=lastVisited');
      }
    } else if (isAuthLinkSent && !needsConfirmation) {
      redirectToWaiting();
    } else if (authLinkUser) {
      const { additionalUserInfo } = authLinkUser;
      if (additionalUserInfo.isNewUser) {
        setDialog('Welcome! Create a display name and a password for extra security :)');
        setAuthMode({ newUser: true, action: 'create account' });
      } else if (isAuthenticated) {
        localStorage.removeItem('potatoStorage');
        redirectTo('/chat/rooms/?rm=lastVisited');
      }
    }
    return () => {
      // form
      // sessionStorage.clear();
      setAuthMode({ register: true, action: 'send dynamic link' });
    };
  }, [oAuthResponse, isAuthLinkSent, authLinkUser, isAuthenticated]);


  const displayNameInput = (
    <div className="formGroup">
      <p className="errorMessage">{displayNameError}</p>
      <input
        className="input displaynameInput"
        type="text"
        name="displayName"
        placeholder="username"
        value={displayName || ''}
        onChange={handleChange}
      />
    </div>
  );

  const emailInput = (
    <div className="formGroup">
      <p className="errorMessage">{emailError}</p>
      <input
        className="input emailInput"
        type="email"
        name="email"
        placeholder="email"
        value={email || ''}
        onChange={handleChange}
      />
    </div>
  );

  const passwordInput = (
    <div className="formGroup">
      <p className="errorMessage">{passwordError}</p>
      <input
        className="input passwordInput"
        type="password"
        name="password"
        placeholder="password"
        value={password || ''}
        onChange={handleChange}
      />
    </div>
  );

  const SubmitFormButton = props => {
    const { action, onClick } = props;
    return (
      <button
        className="submitFormButton"
        type="submit"
        onClick={onClick || null}>
        {action}
      </button>
    );
  };

  const oAuthButton = provider => {
    return (
      <li className="authLogo">
        <img
          className="oAuthButton"
          alt=""
          onClick={() => setSelection(provider.providerId)}
          alt=""
          src={provider.path}>
        </img>
      </li>
    );
  }

  const disclaimerEtc = (
    <p className="toggleFormLink">
      Hey,
      <br />
      <br />
      If you need all information that you've shared through this domain removed and/or transfered to you, please email info@michaelcruz.io with your request<span> :).</span>
      <br />
      <br />
      Love,
      <br />
      Michael
    </p>
  );

  // const authDialog = (
  //   <p>{dialog}</p>
  // );

  const oAuthButtons = Object.keys(providerData).map(authProvider => {
    return (
      <div key={authProvider} className="oAuthWrapper">
        <ul className="oAuthButtons">
          {oAuthButton(providerData[authProvider])}
        </ul>
      </div>
    );
  });

  const loadingAnimation = (
    <aside className="modalHeader">
      <button className="exitButton" onClick={() => {
        localStorage.removeItem('potatoStorage');
        firebase.auth().signOut();
        redirectTo('/');
      }}>
        <i className="material-icons clearIcon">clear</i>
        <p>for dev puposes only, proceed at your own risk </p>
      </button>
      <div className="loadingAnimation" />
    </aside>
  );

  const userDetails = (
    <Fragment>
      {passwordInput}
      {displayNameInput}
    </Fragment>
  );

  const registrationForm = (
    <Modal show={true} handleClose={handleClose}>
      <form className="registrationForm" onSubmit={handleSubmit}>
        <fieldset className="registrationFieldset">
          <legend className="formLegend">
            <p className="appNameAtAuth">Potato</p>
          </legend>
          <section className="parentFlex">
            <section className="oAuthDialog">
              {authMode.register ? <p>continue with a <span>federated identity provider</span></p> : null}
            </section>
            <section className="oAuthContainer">
              {authMode.error ? <p>bummer, something went wrong</p> : null}
              {authMode.register ? oAuthButtons : null}
            </section>
            <footer>
              {disclaimerEtc}
            </footer>
          </section>
        </fieldset>
      </form>
    </Modal>
  );

  return potatoStorage ? loadingAnimation : registrationForm
}

export default RegistrationForm;
