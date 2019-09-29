import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import SessionContext from '../SessionContext.js';
// import './Rooms.css';

class DashChannels extends React.Component {

  static contextType = SessionContext;

  handleChange = e => {
    this.props.history.push(`/chat/rooms/?rm=${e.target.value}`);
  }

  render() {
    const { subscribedRooms, activeRoom } = this.context.state;
    const rooms = subscribedRooms.map((room, i) => {
      const { key, name } = room;
      const isCursor = key === activeRoom.key;
      return (
        <li key={key}>
          <Link className="roomNameButton" to={`/chat/rooms?rm=${key}`}>
            <div>
              <i className="material-icons people">people</i>
              <p className="roomName">{ name }</p>
            </div>
          </Link>
        </li>
      );
    });
    return !subscribedRooms.length
      ? <div className="widgetLoader"></div>
      : <ul className="dashChannelsList">{rooms}</ul>;
  }
};

export default withRouter(DashChannels);
