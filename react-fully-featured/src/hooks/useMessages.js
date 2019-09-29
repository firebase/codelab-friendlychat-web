import * as firebase from 'firebase';
import { useState, useEffect } from "react";
import { staticMessages } from '../staticState.js';

function useMessages(roomId) {
  const [messages, setData] = useState(staticMessages);
  const [loading, setLoading] = useState(true);
  async function fetchUrl() {
    const res = await fetch(`${process.env.REACT_APP_HTTP_URL}/getMessages`, {
      method: 'POST',
      body: JSON.stringify({ roomId, messageCount: 100 })
    });
    const messages = await res.json();
    setData(messages);
    setLoading(false);
  }
  useEffect(() => {
    fetchUrl();
  }, []);
  return [messages, loading];
}

export { useMessages };
