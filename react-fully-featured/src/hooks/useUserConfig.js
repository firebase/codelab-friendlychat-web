import * as firebase from 'firebase';
import useUser from './useUser.js';
import { useState, useEffect } from "react";
// import { staticUserConfig } from '../staticState.js';

function useUserConfig() {
  const [user, uid] = useUser();
  const [userConfig, setData] = useState({});
  const [loading, setLoading] = useState(true);
  async function fetchUrl() {
    const res = await fetch(`${process.env.REACT_APP_HTTP_URL}/getUserConfig`, {
      method: 'POST',
      body: JSON.stringify({ uid })
    });
    const { userConfig } = await res.json();
    setData(userConfig);
    setLoading(false);
  }
  useEffect(() => {
    if (uid != null) fetchUrl();
  }, []);
  return [userConfig, loading];
}

export { useUserConfig };

















// const getUserConfig = async uid => {
//   const url = `${process.env.REACT_APP_HTTP_URL}/getUserConfig`;
//   const userConfig = await goFetch(url, {
//     method: 'POST',
//     body: JSON.stringify({ uid })
//   });
//   return userConfig;
// };
