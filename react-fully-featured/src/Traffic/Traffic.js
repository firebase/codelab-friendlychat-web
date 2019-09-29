import React, { useState, useContext, useEffect } from 'react';
import * as firebase from 'firebase';
import SessionContext from '../SessionContext.js';
import defaultUserImage from './../assets/images/peaceful_potato.png';
import ErrorBoundary from '../ErrorBoundary.js';
import Timeago from './../timeago/timeago.js';
import { throttling } from '../utils.js';
// import '../Menu/Menu.css';

const Traffic = props => {

  const { state } = useContext(SessionContext);
  const { activeRoom } = state;
  const [actions, setActions] = useState([]);

  useEffect(() => {

    let buffer = [];
    const trafficThrottler = throttling(async () => {
      const sortedActions = await buffer.sort((a, b) => {
        return a.uxixStamp - b.unixStamp;
      });
      const slicedActions = await sortedActions.slice(Math.max(0));
      await setActions(sortedActions.reverse());
    }, 100);

    const addedRef = firebase.database().ref(`/TRAFFIC`);
    addedRef
      .on('child_added', async snap => {
        // const unixStamp = await firebase.database.ServerValue.TIMESTAMP;
        const user = await snap.val();
        // user.unixStamp = Date.now();
        buffer.push(user);
        trafficThrottler();
      });
    return () => {
      // addedRef.off();
      setActions([]);
    }

  }, [activeRoom]);

  const actionsList = actions.map((user, i) => {
    const { photoURL, displayName, action, uid, unixStamp } = user;
    return (
      <li className="trafficListItem" key={i}>
        <ErrorBoundary>
          <img
            className="trafficImage"
            alt="user"
            src={ photoURL || defaultUserImage}
          />
          <div className="trafficDisplayName">
           {displayName}
          </div>
          <div className="trafficUserAction">
            <p>{action || 'dud'}</p>
          </div>
          <Timeago className="timeago" timestamp={ unixStamp || 'sometime' } />
        </ErrorBoundary>
      </li>
    );
  });
  return !actions.length
    ? <div className="widgetLoader"></div>
    : (
      <fieldset className="trafficFieldset">
        <legend className="roomsLegend">
          <p className="roomsLegendTitle">traffic</p>
        </legend>
        <ul className="trafficList">
          {actionsList}
        </ul>
      </fieldset>
    );
}

export default Traffic;
