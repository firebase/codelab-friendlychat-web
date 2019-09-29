import React, { useState, useEffect } from 'react';
import * as firebase from 'firebase';

const useFcmToken = (uid, messaging) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [fcmTokenError, setFcmTokenError] = useState(null);
  useEffect(() => {
    let didCancel = false;
    async function fetchToken() {
      try {
        const token = await requestNotifPermission(uid, messaging);
        if (!didCancel) setFcmToken(token);
      } catch (error) {
        if (!didCancel) {
          setFcmTokenError(error);
        }
      }
    };
    fetchToken();
    return () => { didCancel = true; };
  }, [fcmToken]);
  const initNotifications = async user => {
    try {
      if (firebase.messaging.isSupported()) {
        const messaging = firebase.messaging();
        const currentFcmToken = await messaging.getToken();
        this.handleFcmToken(currentFcmToken, user.uid, true);
        messaging.onTokenRefresh(async () => {
          console.log('refreshed token');
          const fcmToken = await requestNotifPermission(user.uid, messaging);
          return fcmToken;
        });
      } else {
        setFcmTokenError('this browser does not support push notifications');
      }
    } catch(error) {
      setFcmTokenError(error);
    }
  };
  const requestNotifPermission = (uid, messaging) => {
    return messaging.requestPermission()
      .then(() => {
        const fcmToken = messaging.getToken();
        return fcmToken;
      })
      .then(token => {
        console.log(token);
        return this.handleFcmToken(token, uid, true)
        .then(fcmToken => {
          return token;
        });
      })
      .catch(error => {
        setFcmTokenError(error);
      });
  };
  return { fcmToken, fcmTokenError }
};

export default useFcmToken;
