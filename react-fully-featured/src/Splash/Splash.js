import React from 'react';
import * as firebase from 'firebase';
import { Link, Redirect } from 'react-router-dom';
import './Splash.css';

class Splash extends React.Component  {

  render() {
    // console.log(this.props);
    if (this.props.isAuth) {
      return <Redirect to={'/chat/rooms/?rm=lastVisited'} />
    }
    return (
      <div className="splashComponent">
        <header className="splashHeader">
          <Link className="anchor" to={'/'}>
            <div className="nameLogoContainer">
              <img className="splashLogo" src={require("../assets/images/potato2.svg")}
                   alt="potato logo"
              />
              <p className="splashAppName">Potato</p>
            </div>
          </Link>
          <Link to={`/auth/registration`}>
            <i className="material-icons menuIcon">menu</i>
          </Link>
        </header>
        <main className="splashMain">
          <section className="mainContentContainer">
            <h1 className="hero">
              Live chat with anyone, simplified.
            </h1>
            <p className="appDescription">
              Welcome to your new live chat application! Share your thoughts and ideas with anybody, anywhere. Click the link below to get started.
            </p>
            <Link to={`/auth/registration`}>
              GET STARTED
            </Link>
          </section>
          <section className="companyImagesContainer">
            <img className="firebaseLogo" alt="" src={require("../assets/Built_with_Firebase_Logo_Light.svg")} />
            <img className="reactLogo" alt="" src={require("../assets/react_logo.svg")} />
          </section>
        </main>
      </div>
    )
  };
};

export default Splash;
