import React, { Component } from 'react';
import './Messages.css';

import Timeago from './../timeago/timeago.js';
import defaultUserImage from './../assets/images/peaceful_potato.png';

const ReactMarkdown = require('react-markdown/with-html');

class Direct extends Component {
  constructor (props) {
    super(props);
  }

  render() {
    const { direct, user } = this.props;
    return (
      <li key={direct.key} className="message">
        <div className="imageMessageContainer">
          <img
            className="messageImage"
            alt="user"
            src={direct.creator && direct.creator.photoURL
            ? direct.creator.photoURL : defaultUserImage}
           />
          <div className="nameMessageContainer">
            <div className="display-name">
              {direct.creator.displayName}
              {direct.creator && this.props.user && direct.creator.email === this.props.user.email &&
                <button
                  onClick={ () => this.clearDirect(direct) }
                  className="clearDirectButton">
                  &times;
                </button>
              }
            </div>
            <div className="content">
              <ReactMarkdown escapeHtml={false} source={direct.content} />
            </div>
          </div>
        </div>
        <Timeago className="timeago" timestamp={ direct.sentAt || 'sometime' } />
      </li>
    )
  }
}

export default Direct;
