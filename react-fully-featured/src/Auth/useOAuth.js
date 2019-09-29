import { useState, useEffect, useReducer } from 'react';
import * as firebase from 'firebase';

const useOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState(false);
  const [oAuthResponse, setOAuthResponse] = useState(false);
  const [methods, setMethods] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [additionalUserInfo, setAdditionalUserInfo] = useState(false);
  const [oAuthError, setOAuthError] = useState(false);
  const [isOAuthCanceled, setIsOAuthCanceled] = useState(false);
  const [isOAuthBusy, setIsOAuthBusy] = useState(false);
  const [linkRes, setLinkRes] = useState(false);
  const [unlinkSuccess, setUnlinkSuccess] = useState(false);
  const [authToast, setAuthToast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getOAuthProvider = providerId => {
  	switch (providerId) {
  		case 'google.com':
  			return {method: 'signInWithRedirect', instance: new firebase.auth.GoogleAuthProvider(), name: 'Google', providerId: 'google.com'};
  		case 'github.com':
  			return {method: 'signInWithRedirect', instance: new firebase.auth.GithubAuthProvider(), name: 'GitHub', providerId: 'github.com'};
      case 'facebook.com':
  			return {method: 'signInWithRedirect', instance: new firebase.auth.FacebookAuthProvider(), name: 'Facebook', providerId: 'facebook.com'}
  		default:
  		  return 'auth provider selection is not present';
  	}
  }

  const unLinkAccount = async () => {
    const { user, additionalUserInfo } = oAuthResponse;
    // const { providerId } = additionalUserInfo;
    user.unlink('github.com').then(result => {
      setUnlinkSuccess({true: true, result});
    }).catch(function(error) {
      setUnlinkSuccess({true: false, error});
    });
  }

  const linkAccounts = async (initProvider, pendingCred) => {
    const { method, instance } = await getOAuthProvider(initProvider);
    const sessionCred = JSON.stringify(pendingCred);
    sessionStorage.setItem('pendingCred', sessionCred);
    firebase.auth().signInWithRedirect(instance);
  }

  const updateUserDetails = async payload => {
    const user = await firebase.auth().currentUser;
    const {  displayName, password } = payload;
    let toast = {};
    await user.updateProfile({
      displayName
    }).then(function(res) {
      console.log(res);
      // toast['displayName'] = 'displayName updated';
    }).catch(function(error) {
      // toast['error'] = 'displayName not set';
    });
    await user.updatePassword(password).then(function(res) {
      // toast['password'] = 'password updated';
    }).catch(function(error) {
      // toast['error'] = 'displayName not set';
    });
    // setAuthToast(toast);
    // if (!toast['error']) {
    //   setIsAuthenticated(true);
    // }
    // user.updateEmail("user@example.com").then(function() {
    //   // Update successful.
    // }).catch(function(error) {
    //   // An error happened.
    // });
    console.log(user, payload);
  }

  const requestOAuth = async (pendingCred) => {
    if (selection) {
      const authInstance = await getOAuthProvider(selection);
      localStorage.setItem('potatoStorage', 'redirecting');
      await firebase.auth().signInWithRedirect(authInstance.instance);
    }
  };

  useEffect(() => {
    if (selection) requestOAuth();
    firebase.auth().getRedirectResult()
      .then(result => {
        if (result.credential) {
          const { additionalUserInfo } = result;
          const { isNewUser } = additionalUserInfo;
          setAdditionalUserInfo(additionalUserInfo);
          setIsNewUser(isNewUser);
          setOAuthResponse(result);
        }
        const cred = window.sessionStorage.getItem('pendingCred');
        const parsedCred = firebase.auth.AuthCredential.fromJSON(cred);
        sessionStorage.clear();
        if (parsedCred) result.user.linkAndRetrieveDataWithCredential(parsedCred).then(function(usercred) {
          // GitHub account successfully linked to the existing Firebase user.
          console.log(usercred);
        }).catch(error => {
          console.log(error);
        });
      })
      .catch(error => {
        if (error.code === 'auth/account-exists-with-different-credential') {
          setOAuthResponse(error);
        }
        setOAuthError({error, source: 'requestOAuth'});
      });
    return () => {
      setSelection(false);
      // setIsOAuthCanceled(true);
    }
  }, [selection]);

  return {
    oAuthError,
    oAuthResponse,
    setOAuthResponse,
    setSelection,
    methods,
    setIsNewUser,
    setAdditionalUserInfo,
    additionalUserInfo,
    setMethods,
    isOAuthCanceled,
    setIsOAuthCanceled,
    isLoading,
    setIsLoading,
    requestOAuth,
    selection,
    getOAuthProvider,
    linkAccounts,
    unLinkAccount,
    updateUserDetails,
    authToast,
    isAuthenticated,
    setIsAuthenticated
    // oAuthStatus,
    // setOAuthStatus
  };
};

export default useOAuth;
