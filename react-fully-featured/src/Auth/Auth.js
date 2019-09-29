import React, { useEffect, useState, Fragment } from 'react';
import { Route } from 'react-router-dom';
import RegistrationForm from './RegistrationForm.js';
import Waiting from './Waiting.js';
import useOAuth from './useOAuth.js';
import useAuthLink from '../hooks/useAuthLink.js';
import * as firebase from 'firebase';
import './Auth.css';

const Auth = props => {
  const {
    oAuthResponse,
    setOAuthResponse,
    methods,
    setMethods,
    setSelection,
    isOAuthCanceled: dead,
    setIsOAuthCanceled,
    oAuthError,
    setOAuthError,
    requestOAuth,
    selection,
    authProviders,
    linkAccounts,
    unLinkAccount,
    authProviderInstances,
    getOAuthProvider,
    updateUserDetails,
    authToast,
    setIsOAuthSent,
    isOAuthSent,
    isAuthenticated,
    setIsAuthenticated
  } = useOAuth();
  const { authEmail, isAuthLinkSent, setIsAuthLinkSent, setAuthEmail, signInWithLink, authLinkUser, needsConfirmation, setNeedsConfirmation } = useAuthLink();

  const { isSignedOut } = props;

  useEffect(() => {
    return () => {
      setIsAuthLinkSent(false);
      setIsOAuthCanceled(true);
    }
  }, [oAuthResponse, isAuthLinkSent, isSignedOut]);

	return (
		<Fragment>
			<Route path='/auth/registration' render={muhProps => {
        return (
          <RegistrationForm
            handleClose={() => { props.history.push('/') }}
            redirectTo={ url => props.history.push(url) }
            redirectToWaiting={() => { props.history.push('/auth/waiting') }}
            redirectToChat={() => { props.history.push('/chat/rooms/?rm=lastVisited') }}
            redirectToAuthChat={() => { props.history.push('/chat/rooms/?rm=init') }}
            setSelection={setSelection}
            setAuthEmail={setAuthEmail}
            oAuthResponse={oAuthResponse}
            isAuthLinkSent={isAuthLinkSent}
            dead={dead}
            authEmail={authEmail}
            selection={selection}
            authProviders={authProviders}
            linkAccounts={linkAccounts}
            unLinkAccount={unLinkAccount}
            signInWithLink={signInWithLink}
            authLinkUser={authLinkUser}
            needsConfirmation={needsConfirmation}
            authProviderInstances={authProviderInstances}
            getOAuthProvider={getOAuthProvider}
            updateUserDetails={updateUserDetails}
            authToast={authToast}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            isSignedOut={isSignedOut}
          />
        );
      }} />
      <Route path='/auth/waiting' render={muhProps => {
        return (
          <Waiting
            redirectToRegistration={() => { props.history.push('/auth/registration') }}
            redirectToChat={() => { props.history.push('/chat/rooms/?rm=lastVisited') }}
            authEmail={authEmail}
            signInWithLink={signInWithLink}
            needsConfirmation={needsConfirmation}
            setNeedsConfirmation={setNeedsConfirmation}
            authLinkUser={authLinkUser}
          />
        );
      }} />
		</Fragment>
	);
};

export default Auth;
