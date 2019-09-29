import React, { useState, useEffect } from 'react';
import * as firebase from 'firebase';

const useSignInMethods = emailAddr => {
  const [email, setEmail] = useState(emailAddr);
  const [methods, setMethods] = useState(null);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [signInMethodError, setSignInMethodError] = useState(null);
  async function fetchMethods() {
    try {
      await firebase.auth().fetchSignInMethodsForEmail(emailAddr).then(methods => {
        if (methods[0] === 'password') {
          return setMethods(methods);
        }
      }).catch(error => {
        setMethodsLoading(false);
        setSignInMethodError(error);
      });
    } catch (error) {
      setMethodsLoading(false);
      setSignInMethodError(error);
    }
  }
  useEffect((emailAddr) => {
    if (emailAddr !== null) fetchMethods();
    return () => firebase.auth().off();
  }, []);
  return { email, methods, signInMethodError, methodsLoading };
};

export default useSignInMethods;
