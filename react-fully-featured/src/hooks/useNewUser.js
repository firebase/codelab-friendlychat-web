import React, { useState, useEffect } from 'react';
import * as firebase from 'firebase';

const useNewUser = room => {
  const [roomId, getRoomId] = useState(room);
  const [newUser, setNewUser] = useState(null);
  const [newUserError, setNewUserError] = useState(null);
  const userRef = firebase.database().ref(`users`);
  useEffect((roomId) => {
    this.onlineUsersRef.orderByChild('lastVisited').equalTo(roomId)
    .limitToLast(1)
    .on('child_added', snap => {
      setNewUser(newUser);
    })
    .catch(error => setNewUserError(error));
    return () => { userRef.off() };
  }, [newUser]);
  return { newUser, setNewUser };
};

export default useNewUser;
