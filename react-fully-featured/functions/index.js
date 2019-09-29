const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true,
});

const admin = require('firebase-admin');
serviceAccount = require('./serviceAccountKey.json');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp();

exports.getRoomsAndUserConfig = functions.https.onRequest((req, res) => {
  async function getRooms(roomIds) {
    return Promise.all(roomIds.map(async room => {
      const roomRef = await admin.database().ref(`rooms/${room}`);
      return roomRef.once('value');
    }));
  };
  return cors(req, res, () => {
    const { uid, displayName } = JSON.parse(req.body);
    const userRef = admin.database().ref('/users');
    const roomRef = admin.database().ref('/rooms');
    return userRef.child(uid).once("value", async snapshot => {
      if (snapshot.exists()) {
        const subscribedRooms = await getRooms(snapshot.val().rooms);
        res.json({ userConfig: snapshot.val(), subscribedRooms });
      } else {
        res.send('user config does not exist');
      }
    });
  });
});

exports.getUserConfig = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const { uid } = req.body;
    const userRef = admin.database().ref(`users`);
    return userRef.child(uid).once("value", async snapshot => {
      if (snapshot.exists()) {
        const userConfig = snapshot.val();
        res.json({ userConfig });
      } else {
        res.json({ error: 'userConfig does not exist for this user' });
      }
    });
  });
});

exports.getRooms = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { roomIds } = req.body;
    async function getRoomsByKeys(roomIds) {
      return Promise.all(roomIds.map(async room => {
        const roomRef = await admin.database().ref(`rooms/${room}`);
        return roomRef.once('value');
      }));
    };
    const subscribedRooms = await getRoomsByKeys(roomIds);
    res.json({ subscribedRooms });
  });
});

exports.createRoomsAndUserConfig = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { displayName, email, photoURL, emailVerified, uid, authProviders } = req.body;
    const usersRef = admin.database().ref('/users');
    const roomRef = admin.database().ref('/rooms');
    const subsRef = admin.database().ref(`/rooms`);
    const og1UsersRef = admin.database().ref('/rooms/uid-lyKXW2vVGKMjkdN1C1rwugov5Tn1/users');
    const og1AdminsRef = admin.database().ref('/rooms/uid-lyKXW2vVGKMjkdN1C1rwugov5Tn1/admins');
    const messagesRef = admin.database().ref('/messages');
    const messageKey = messagesRef.push().key;
    const userConfig = {
      key: uid,
      displayName,
      email,
      photoURL,
      emailVerified,
      authProviders,
      lastVisited: `uid-lyKXW2vVGKMjkdN1C1rwugov5Tn1`,
      rooms: ['uid-lyKXW2vVGKMjkdN1C1rwugov5Tn1', `uid-${uid}`],
      action: 'sup',
      activity: { isOnline: true, unixStamp: Math.floor(Date.now() / 1000) }
    };
    const room = {
      active: false,
      creator: uid,
      dscription: `${displayName}'s first room. Welcome!`,
      name: `mykey's channel`,
      key: `uid-${uid}`,
      users: { [uid]: displayName },
      admins: { [uid]: displayName }
    };
    const message = {
      content: 'Welcome to Potato!',
      creator: {
        displayName: 'mykey',
        email: 'potato@michaelcruz.io',
        photoURL: 'https://lh3.googleusercontent.com/-42Rxl6komNU/AAAAAAAAAAI/AAAAAAAAAJ0/n2btuWyx90o/photo.jpg',
        uid: 'wWV3cvFFK5g4Ok0MlYQXynnI9xZ2'
      },
      key: messageKey,
      read: false,
      roomId: `uid-${uid}`,
      sentAt: Math.floor(Date.now() / 1000),
    };
    await usersRef.child(uid).update(userConfig);
    await messagesRef.child(messageKey).update(message);
    await roomRef.child(`uid-${uid}`).update(room);
    await subsRef.child(`uid-${uid}/users/${uid}`).update(userConfig);
    await og1UsersRef.child(uid).update(userConfig);
    await og1AdminsRef.child(uid).update(userConfig);
    res.json({ userConfig, activeRoom: room, subscribedRooms: [room, `uid-${uid}`] });
  });
});

exports.gitHubPushWebHook = functions.https.onRequest((req, res) => {
  const messageRef = admin.database().ref('/messages');
  const {head_commit} = req.body;
  return messageRef.push({
    content: '### repo update alert',
    sentAt: Date.now(),
    roomId: "-Ld7mZCDqAEcMSGxJt-x",
    creator: {
      uid: null,
      email: null,
      displayName: "GitHub",
      photoURL: "https://avatars3.githubusercontent.com/u/9919?s=40&v=4"
    }
  }).then(() => {
    res.end();
  });
});

exports.addTokenToTopic = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const {uid, fcmToken, subscription} = JSON.parse(req.body);
    const userRef = admin.database().ref(`/users/${uid}/fcmTokens`);
    admin.messaging().subscribeToTopic([fcmToken], `topic-${uid}`)
      .then(function(response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', response);
        return userRef.child(fcmToken).set(subscription).then(function() {
          return res.send(response);
        });
      })
      .catch(function(error) {
        console.log('Error subscribing to topic:', error);
        res.send(error);
      });
  });
});

exports.sendMessageToTopic = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const {uid, message} = JSON.parse(req.body);
    const payloadMessage = {
      data: { message },
      topic: `topic-${uid}`
    };
    admin.messaging().send(payloadMessage)
    .then((response) => {
      console.log(response);
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
  });
});

exports.sendMessageToUsers = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const {usersTokens, message, sender} = JSON.parse(req.body);
    // const usersRef = admin.database().ref('users');
    const payload = {
      notification: {
        title: `new mention from ${sender.displayName}`,
        body: message
      },
      data: { message: JSON.stringify({sender, message}) }
    };
    admin.messaging().sendToDevice(usersTokens, payload)
      .then((response) => {
        res.send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  });
});

exports.getMessages = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { roomId, messageCount } = JSON.parse(req.body);
    console.log(roomId, messageCount, 'asnclksmdlkc');
    const messagesRef = await admin.database().ref(`messages`);
    await messagesRef
      .orderByChild('roomId')
      .equalTo(roomId)
      .limitToLast(messageCount)
      .once("value", async snap => {
        const messages = snap.val();
        res.send({ messages });
      });
  });
});

exports.handleSignOut = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.set('Access-Control-Allow-Origin', '*');
    const uid = req.query.uid;
    const pendingFcmToken = req.query.fcmToken;
    admin.database().ref(`/users/${uid}/fcmTokens/${pendingFcmToken}`).set(false)
    .then(() => res.send(true));
  });
});

exports.verifyDisplayname = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    const displayname = req.query.displayname;
    displaynameRef = admin.database().ref(`users`);
    await displaynameRef.orderByChild('createdAt').once("value", async snap => {
      snap.forEach(user => {
        if (user.val().displayName === displayname) {
          res.send(false);
        }
      });
    });
    res.send(true);
  });
});

exports.getUserConfigs = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const { uids } = req.body;
    console.log(uids, 'init getuserconfigs');
    async function getUserConfigs(uids) {
      return await Promise.all(uids.map(async uid => {
        const userRef = await admin.database().ref(`users/${uid}`);
        return userRef.once('value');
      }));
    };
    const userConfigs = await getUserConfigs(uids);
    res.json({ userConfigs });
  });
});
