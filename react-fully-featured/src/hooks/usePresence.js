import React, { useState, useEffect, useReducer } from 'react';
import * as firebase from 'firebase';

const usePresence = uid => {
  const [error, setError] = useState(null);
  const userStatusDatabaseRef = firebase.database().ref(`users/${uid}/activity`);
  const isOfflineForDatabase = {
    isOnline: false,
    lastChanged: firebase.database.ServerValue.TIMESTAMP,
  };
  const isOnlineForDatabase = {
    isOnline: true,
    lastChanged: firebase.database.ServerValue.TIMESTAMP,
  };
  useEffect(() => {
    try {
      function handleStatusChange() {
        firebase.database().ref('.info/connected').on('value', snapshot => {
          if (snapshot.val() === false) return;
          userStatusDatabaseRef.onDisconnect()
          .set(isOfflineForDatabase).then(() => {
            userStatusDatabaseRef.update(isOnlineForDatabase);
          });
        });
      };
      handleStatusChange();
    } catch (error) {
      setError(error);
    }
    return function cleanup() {
      setError(null);
    }
  }, []);
  return error ? error : null;
};

export default usePresence;


// const handleConnection = uid => {
//   const userStatusDatabaseRef = firebase.database().ref(`users/${uid}/activity`);
//   const isOfflineForDatabase = {
//     isOnline: false,
//     lastChanged: firebase.database.ServerValue.TIMESTAMP,
//   };
//   const isOnlineForDatabase = {
//     isOnline: true,
//     lastChanged: firebase.database.ServerValue.TIMESTAMP,
//   };
//   firebase.database().ref('.info/connected').on('value', function(snapshot) {
//     if (snapshot.val() === false) {
//       return;
//     };
//     userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
//       userStatusDatabaseRef.update(isOnlineForDatabase);
//     });
//   });
// };
