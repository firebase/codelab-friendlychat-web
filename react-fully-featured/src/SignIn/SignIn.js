import React, {Fragment} from 'react';
import Auth from '../Auth/Auth.js';
import './SignIn.css';

class SignIn extends React.Component  {
  state = {
    showAuthModal: true
  };

  toggleAuthModal = () => {
    this.setState({ showAuthModal: !this.state.showAuthModal });
  };

  render() {
    const { inWaiting, updateSession } = this.context;
    const auth = (
      <Auth toggleAuthModal={this.toggleAuthModal.bind(this)} />
    );
    return (
      <React.Fragment>
        { this.state.showAuthModal ? auth : null }
        { inWaiting ? null : null }
      </React.Fragment>
    )
  };
};

export default SignIn;
