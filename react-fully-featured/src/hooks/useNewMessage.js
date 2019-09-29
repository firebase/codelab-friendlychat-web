import React, { useState, useEffect } from 'react';
import * as firebase from 'firebase';

const useNewMessage = (roomId) => {
  const [newMessage, setNewMessage] = useState({});
  const [newMessageError, setNewMessageError] = useState(null);
  const messageRef = firebase.database().ref(`messages`);
  // const messageRef = firebase.database().ref(`messages`);
  useEffect(
    () => {
      try {
        messageRef.orderByChild('roomId')
        .equalTo(roomId)
        .limitToLast(1)
        .on('child_added', snap => {
          if (snap.val().roomId === roomId) {
            const message = Object.assign({}, snap.val(), { key: roomId });
            setNewMessage(message);
          }
        });
      } catch(error) {
        setNewMessageError(error);
      }
    }, [roomId]);
  return () => null;
  return [newMessage, newMessageError];
}

export default useNewMessage;

// const setListeners = key => {
//   this.onlineUsersRef
//   .orderByChild('lastVisited')
//   .equalTo(key)
//   .limitToLast(1)
//   .on('child_added', snap => {
//     const oldUsers = this.state.users;
//     this.setState({ users: oldUsers.concat(snap.val()) });
//   });
//   this.messagesRef
//   .orderByChild('roomId')
//   .equalTo(key)
//   .limitToLast(1)
//   .on('child_removed', snapshot  => {
//     if (snapshot.val().roomId === key) {
//       const deletedKey = snapshot.key;
//       const { [deletedKey]: something, ...rest } = this.state.messages;
//       const newMessages = Object.assign({}, rest);
//       this.setState({ messages: newMessages });
//     }
//   });
// };
