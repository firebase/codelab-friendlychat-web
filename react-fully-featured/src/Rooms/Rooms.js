import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import SessionContext from '../SessionContext.js';
import './Rooms.css';

class Rooms extends React.Component {

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
        <option key={name} value={key} selected={isCursor}>{name}</option>
      );
    });
    return !subscribedRooms.length
      ? <div className="widgetLoader"></div>
      : (
        <form>
          <fieldset className="roomsFieldset">
            <legend className="roomsLegend">
              <p className="roomsLegendTitle">active room</p>
            </legend>
            <select className="roomSelect" value={activeRoom.key}
              onChange={e => this.handleChange(e)}>
              {rooms}
            </select>
          </fieldset>
        </form>
      );
  }
};

export default withRouter(Rooms);
