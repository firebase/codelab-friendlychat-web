import React, { useEffect, useState, Fragment } from 'react';
import { Route } from 'react-router-dom';
import * as firebase from 'firebase';

const Waiting = props => {
  console.log(props);
  const inboundReq = firebase.auth().isSignInWithEmailLink(window.location.href);
  const [inboundAuthReq, setInboundAuthReq] = useState(inboundReq);
  const [cachedEmail, setCachedEmail] = useState(false);

  const { redirectToRegistration, authEmail, signInWithLink, setNeedsConfirmation, authLinkUser } = props;


  useEffect(() => {
    const email = window.localStorage.getItem('potatoEmail') || false;
    if (!email) {
      console.log(email, cachedEmail);
      setNeedsConfirmation(true);
      redirectToRegistration();
    } else if (email && inboundAuthReq) {
      signInWithLink(email);
    } else if (authLinkUser) {
      redirectToRegistration();
    }
    setCachedEmail(email);
    return () => {
      setInboundAuthReq(false);
    }
  }, [inboundAuthReq, authEmail, authLinkUser]);

  return (
		<Fragment>
			<h1>in waiting</h1>
		</Fragment>
	);
};

export default Waiting;
