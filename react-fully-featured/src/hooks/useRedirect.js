import { useState, useEffect } from 'react';
// import RealTimeApi from '../RealTimeApi.js';
import * as firebase from 'firebase';

const useRedirect = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [redirectError, setRedirectError] = useState(null);
  const [redirectLoading, setRedirectLoading] = useState(true);
  const [email, setEmail] = useState(null);
  const [isNew, setIsNew] = useState(null);
  const [methods, setMethods] = useState(null);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [methodError, setMethodError] = useState(null);
  const [uid, setUid] = useState(null);

  async function fetchMethods() {
    // setRedirectLoading(true);
    try {
      const redirect = await firebase.auth().getRedirectResult().then(result => {
        if (result.credential) {
          const isNew = result.additionalUserInfo.isNewUser
          const token = result.credential.accessToken;
          const uid = result.user.uid;
          setIsNew(isNew);
          setUserInfo(result.user);
          setEmail(result.user.email);
          setAccessToken(token);
          setUid(uid);
        }
      }).catch(error => {
        setRedirectError(error);
        setRedirectLoading(false);
        setMethodsLoading(false);
      });
      if (email) {
        setMethodsLoading(true);
        const methods = await firebase.auth().fetchSignInMethodsForEmail(email).then(methods => {
          if (methods[0] === 'password') {
            setMethods(methods);
            setMethodsLoading(false);
          }
        }).catch(error => {
          setMethodError(error);
          setMethodsLoading(false);
          setRedirectLoading(false);
        });
      }
    } catch (error) {
      setRedirectError(error);
      setMethodError(error);
      setRedirectLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
    return () => {
      setRedirectLoading(false);
      setMethodsLoading(false);
    }
  }, []);
  return {
    redirectLoading,
    userInfo,
    accessToken,
    isNew,
    methods,
    redirectError,
    methodsLoading,
    setMethodsLoading,
    methodError,
    email,
    uid
  };
};

export default useRedirect;
