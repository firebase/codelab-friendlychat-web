// import { useFakeMessages } from './hooks/useFakeMessages.js';
//
// const faker = require('faker');
// const fs = require('fs');
//
// const getFakeMessages = () => {
//   let messages = {};
//   const messagesRef = firebase.database().ref(`messages`);
//   for (let i = 0; i < 10; i++) {
//     const newMessageRef = messagesRef.push();
//     const message = {
//       "content" : faker.hacker.phrase(),
//       "creator" : {
//         "displayName" : faker.internet.userName(),
//         "email" : faker.internet.email(),
//         "photoURL" : faker.internet.avatar(),
//         "uid" : faker.random.alphaNumeric()
//       },
//       key: newMessageRef.key,
//       "read" : true,
//       "roomId" : "-Ld7mZCDqAEcMSGxJt-x",
//       "sentAt" : 1558661840808,
//     }
//     newMessageRef.set(message, error => {
//       if (error) {
//         console.log(error);
//       } else {
//
//       }
//     });
//     messages[newMessageRef.key] = message;
//   }
//   return messages;
// }
