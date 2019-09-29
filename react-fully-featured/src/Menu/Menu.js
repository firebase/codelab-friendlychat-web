import React, { useContext, useEffect } from 'react';
import Rooms from '../Rooms/Rooms.js';
import Users from '../Traffic/Users.js';
import Traffic from '../Traffic/Traffic.js';
import defaultUserImage from './../assets/images/peaceful_potato.png';
import SessionContext from '../SessionContext.js';

import googleImage from '../assets/btn_google_light_focus_ios.svg';
import githubImage from '../assets/GitHub-Mark-64px.png';
import facebookImage from '../assets/f_logo_RGB-Blue_10240.png';
import passwordImage from '../assets/baseline_email_black_18dp.png';

import './Menu.css';

const Menu = () => {
  const sessionContext = useContext(SessionContext);
  const { state } = sessionContext;
  const { userConfig, userConfigs } = state;
  const { authProviders=[] } = userConfig;
  const providerImages = { 'google.com': googleImage, 'facebook.com': facebookImage, 'github.com': githubImage, 'password': passwordImage };

  const providers = authProviders.map((provider, i) => {
    return (
      <li key={provider.providerId}>
        <img
          className="authImage"
          alt="authImage"
          src={providerImages[provider.providerId] || defaultUserImage}
        />
      </li>
    );
  });

  const legendContent = (
    <React.Fragment>
      <img className="userAvatar"
        alt="avatar"
        src={userConfig ? userConfig.photoURL : ''}
      />
      <ul className="authImagesList">{providers}</ul>
    </React.Fragment>
  );

  return (
    <div className="menuComponent">
      <section className="avatarCard">
        <fieldset className="avatarFieldset">
          <legend className="avatarLegend">
            {legendContent}
          </legend>
          <p className="avatarDisplayName">{userConfig.displayName}</p>
        </fieldset>
      </section>
      <section className="roomsCard">
        <Rooms />
      </section>
      <section className="usersCard">
        <Users />
      </section>
      <section className="trafficCard">
        <Traffic />
      </section>
    </div>
  );
};

export default Menu;
