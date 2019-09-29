export default class RealTimeApi {

  goFetch = (uri, inputOptions) => {
    const { headers, ...extraOpts } = inputOptions || {};
    const options = {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(headers || {})
      },
      mode: "cors",
      ...extraOpts
    }
    return fetch(uri, options)
    .then(response => {
      if (!response.ok) {
        const err = new Error(response.statusText);
        err.res = response;
        throw err;
      } else {
        return response.json();
      }
    })
    .catch(err => {
      console.log('from fetch', err);
    });
  };

  createNewUser = async authProfile => {
    const url = `${process.env.REACT_APP_URL}/createRoomsAndUserConfig`;
    const newUser = await this.goFetch(url, {
      method: 'POST',
      body: JSON.stringify(authProfile)
    });
    return newUser ? newUser : {};
  }

  getRooms = async rooms => {
    const url = `${process.env.REACT_APP_URL}/getRooms`;
    const roomIds = rooms ? rooms : [];
    const subscribedRooms = await this.goFetch(url, {
      method: 'POST',
      body: JSON.stringify({ roomIds })
    });
    return subscribedRooms ? subscribedRooms : {};
  };

  getMessages = (roomId, messageCount) => {
    return fetch(`${process.env.REACT_APP_URL}/getMessages`, {
      method: 'POST',
      body: JSON.stringify({ roomId, messageCount })
    })
    .then(res => {
      return res.json();
    }).catch(error => {
      console.log(error);
    });
  };

  getUserConfig = async uid => {
    const url = `${process.env.REACT_APP_URL}/getUserConfig`;
    const userConfig = await this.goFetch(url, {
      method: 'POST',
      body: JSON.stringify({ uid })
    });
    return userConfig;
  };

  getActiveRoom = async roomId => {
    const payload = [roomId];
    const url = `${process.env.REACT_APP_URL}/getRooms`;
    const response = await this.goFetch(url, {
      method: 'POST',
      body: JSON.stringify({ roomIds: payload })
    });
    return response.subscribedRooms[0];
  };

  getUserConfigs = async uids => {
    const payload = [uids];
    const url = `${process.env.REACT_APP_URL}/getUserConfigs`;
    const response = await this.goFetch(url, {
      method: 'POST',
      body: JSON.stringify({ uids: uids })
    });
    return response ? response : {};
  };


}
