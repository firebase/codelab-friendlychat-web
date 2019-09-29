import React, { Component } from 'react';
import { staticMessages } from '../staticState.js';
import './Messages.css';

import Timeago from './../timeago/timeago.js';
import defaultUserImage from './../assets/images/peaceful_potato.png';

const ReactMarkdown = require('react-markdown/with-html');

class Message extends Component {

  render() {
    const { msg, user } = this.props;
    // const { msg: baz = 'michaelcruz.io' } = foo;
    // debugger;
    return (
      <div className="message">
        <div className="imageMessageContainer">
          <img
            className="messageImage"
            alt="user"
            src={msg ? msg.creator.photoURL : defaultUserImage}
           />
          <div className="nameMessageContainer">
            <div className="display-name">
              {msg.creator.displayName}
              {msg.creator.uid === user.uid &&
                <button
                  onClick={ () => this.props.deleteMessage(msg) }
                  className="remove-message-button">
                  &times;
                </button>
              }
            </div>
            <div className="content">
              <ReactMarkdown escapeHtml={false} source={msg.content} />
            </div>
          </div>
        </div>
        <Timeago className="timeago" timestamp={ msg.sentAt || 'sometime' } />
      </div>
    )
  }
}

// Message.defaultProps = {
//   "content" : "Wait, what is the symptom?",
//   "creator" : {
//     "displayName" : "mykey",
//     "email" : "michael@michaelcruz.io",
//     "photoURL" : "https://lh3.googleusercontent.com/-42Rxl6komNU/AAAAAAAAAAI/AAAAAAAAAJ0/n2btuWyx90o/photo.jpg",
//     "uid" : "buaySW4zINZ4cWsdykHgmyYqWDy2"
//   },
//   "roomId" : "-Ld7mZCDqAEcMSGxJt-x",
//   "sentAt" : 1558661960574
// };

export default Message;
