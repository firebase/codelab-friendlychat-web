import React from 'react';
import './Messages.css';

import Timeago from './../timeago/timeago.js';
import defaultUserImage from './../assets/images/peaceful_potato.png';

class Mention extends React.Component {
  constructor (props) {
    super(props);
  }

  render() {
    const { mention, user } = this.props;
    return (
      <li key={mention.key} className="message">
        <div className="imageMessageContainer">
          <img
            className="messageImage"
            alt="user"
            src={mention.creator && mention.creator.photoURL
            ? mention.creator.photoURL : defaultUserImage}
           />
          <div className="nameMessageContainer">
            <div className="display-name">
              <button
                onClick={() => this.clearMention(mention.key)}
                className="clearMentionButton">
                &times;
              </button>
            </div>
            {mention.content}
          </div>
        </div>
        <Timeago className="timeago" timestamp={ mention.sentAt || 'sometime' } />
      </li>
    )
  }
}

export default Mention;
