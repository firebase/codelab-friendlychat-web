import * as firebase from 'firebase';
import { useState, useEffect } from "react";
import { staticRooms } from '../staticState.js';

function useRooms(roomIds) {
  const [subscribedRooms, setData] = useState(staticRooms);
  const [loading, setLoading] = useState(true);
  const payload = roomIds ? roomIds : [];
  async function fetchRooms() {
    const res = await fetch(`${process.env.REACT_APP_HTTP_URL}/getRooms`, {
      method: 'POST',
      body: JSON.stringify({ roomIds: payload })
    });
    const { subscribedRooms } = await res.json();
    setData(subscribedRooms);
    setLoading(false);
  }
  useEffect(() => {
    fetchRooms();
  }, []);
  return [subscribedRooms, loading];
}

export { useRooms };



// const getRooms = async rooms => {
//   const url = `${process.env.REACT_APP_HTTP_URL}/getRooms`;
//   const roomIds = rooms ? rooms : [];
//   const subscribedRooms = await goFetch(url, {
//     method: 'POST',
//     body: JSON.stringify({ roomIds })
//   });
//   return subscribedRooms ? subscribedRooms : {};
// };
