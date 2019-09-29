import React, { useState, useEffect } from 'react';
import * as firebase from 'firebase';

const useDeletedMessage = roomId => {
  const [deletedMessage, setDeletedMessage] = useState(null);
  const [deletedMessageError, setDeletedMessageError] = useState(null);
  const messageRef = firebase.database().ref(`messages`);
  useEffect(() => {
    return messageRef.orderByChild('roomId').equalTo(roomId).limitToLast(1)
      .on('child_removed', snapshot => {
        if (snapshot.val().roomId === key) {
          return setDeletedMessage(snapShot.val());
        }
      })
      .catch(error => setDeletedMessageError(error));
    return () => { messageRef.off() };
  }, [deletedMessage]);
  return [deletedMessage, setDeletedMessage];
};

export default useDeletedMessage;
