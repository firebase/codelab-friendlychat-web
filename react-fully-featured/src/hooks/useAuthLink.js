import { useState, useEffect } from 'react';
import * as firebase from 'firebase';

const useAuthLink = () => {

  const [authEmail, setAuthEmail] = useState(false);
  const [authLinkError, setAuthLinkError] = useState(null);
  const [isAuthLinkSent, setIsAuthLinkSent] = useState(false);
  const [authLinkUser, setAuthLinkUser] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [actionCodeSettings, setActionCodeSettings] = useState({
    url: `https://coolpotato.net/auth/waiting`,
    handleCodeInApp: true,
    dynamicLinkDomain: 'coolpotato.page.link'
  });
  const [isAuthLinkCanceled, setIsAuthLinkCanceled] = useState(false);

  const sendAuthLink = async email => {
    return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
      .then(() => {
        localStorage.setItem('potatoEmail', email);
        setIsAuthLinkSent(true);
      })
      .catch(error => {
        setAuthLinkError(error);
      });
  };

  const signInWithLink = async email => {
    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then(result => {
      // Clear email from storage.
        window.localStorage.removeItem('potatoEmail');
        console.log(result);
        setAuthLinkUser(result)
        console.log(result);
      // You can access the new user via result.user
      // Additional user info profile not available via:
      // result.additionalUserInfo.profile == null
      // You can check if the user is new or existing:
      // result.additionalUserInfo.isNewUser
    })
    .catch(error => {
      setAuthLinkError(error);
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
    });
  }

  useEffect(() => {
    if (authEmail) sendAuthLink(authEmail);
    return () => {
      setAuthEmail(false);
      // setIsAuthLinkSent(false);
    }
  }, [authEmail]);

  return {
    authLinkError,
    sendAuthLink,
    authEmail,
    setAuthEmail,
    isAuthLinkSent,
    setIsAuthLinkSent,
    isAuthLinkCanceled,
    setIsAuthLinkCanceled,
    signInWithLink,
    authLinkUser,
    needsConfirmation,
    setNeedsConfirmation,
    setAuthLinkUser
  };
};

export default useAuthLink;
