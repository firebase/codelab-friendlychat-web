import React, { Fragment, useState, useContext, useEffect } from 'react';
import * as firebase from 'firebase';
import SessionContext from '../SessionContext.js';
import defaultUserImage from './../assets/images/peaceful_potato.png';
import ErrorBoundary from '../ErrorBoundary.js';
import { throttling } from '../utils.js';
import Timeago from './../timeago/timeago.js';

const Users = () => {

  const { state } = useContext(SessionContext);
  const { activeRoom } = state;
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const users = activeRoom.users;
    const onliners = Object.assign({}, users);
    const muhSubs = users ? users : {};
    const subscribers = Object.keys(muhSubs);

    let buffer = [];
    const userThrottler = throttling(() => {
      buffer.forEach((user, index) => {
        if (subscribers.includes(user.uid)) onliners[user.uid] = user;
      });
      setSubscribers(Object.values(onliners));
    }, 100);
    const addUserRef = firebase.database().ref(`/USERS_ONLINE`);
    addUserRef.on('child_added', async snap => {
      const user = await snap.val();
      user.action = 'sup';
      user.unixStamp = await Date.now();
      buffer.push(user);
      userThrottler();
    });

    const removeUserRef = firebase.database().ref(`/USERS_ONLINE`);
    removeUserRef.on('child_removed', async snap => {
      const user = await snap.val();
      user.action = 'brb';
      user.unixStamp = await Date.now();
      buffer.push(user);
      userThrottler();
    });
    return () => {
      addUserRef.off();
      removeUserRef.off();
    }
  }, [activeRoom]);

  const subs = subscribers.map((user, i) => {
    const { photoURL, displayName, action, uid, unixStamp } = user;
    return (
      <li className="userListItem" key={i}>
        <ErrorBoundary>
          <img
            className="userImage"
            alt="user"
            src={ photoURL || defaultUserImage}
          />
          <div className="userDisplayName">
            {displayName}
          </div>
          <div className="userUserAction">
            <p>{action || 'dud'}</p>
          </div>
        </ErrorBoundary>
      </li>
    );
  });

  return !subscribers.length
    ? <div className="widgetLoader"></div>
    : (
      <fieldset className="usersFieldset">
        <legend className="usersLegend">
          <p className="usersLegendTitle">subs</p>
        </legend>
        <ul className="usersList">
          {subs}
        </ul>
      </fieldset>
    );
}

export default Users;
