/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const Storage = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const exec = require('child-process-promise').exec;

const visionClient = new vision.ImageAnnotatorClient();
const storageClient = new Storage();

const language = require('@google-cloud/language');
const languageClient = new language.LanguageServiceClient();


// Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate((user) => {
  console.log('A new user signed in for the first time.');
  const fullName = user.displayName || 'Anonymous';

  // Saves the new welcome message into the database
  // which then displays it in the FriendlyChat clients.
  return admin.database().ref('messages').push({
    name: 'Firebase Bot',
    photoUrl: '/assets/images/firebase-logo.png', // Firebase logo
    text: `${fullName} signed in for the first time! Welcome!`
  });
});


// Blurs the given image located in the given bucket using ImageMagick.
function blurImage(object) {
  const filePath = object.name;
  const bucket = storageClient.bucket(object.bucket);
  const fileName = filePath.split('/').pop();
  const tempLocalFile = `/tmp/${fileName}`;
  const messageId = filePath.split('/')[1];

  // Download file from bucket.
  return bucket
    .file(filePath)
    .download({ destination: tempLocalFile })
    .then(() => {
      console.log('Image has been downloaded to', tempLocalFile);
      // Blur the image using ImageMagick.
      return exec(`convert ${tempLocalFile} -channel RGBA -blur 0x24 ${tempLocalFile}`);
    })
    .then(() => {
      console.log('Image has been blurred');
      // Uploading the Blurred image back into the bucket.
      return bucket.upload(tempLocalFile, { destination: filePath });
    })
    .then(() => {
      console.log('Blurred image has been uploaded to', filePath);
      // Indicate that the message has been moderated.
      return admin.database().ref(`/messages/${messageId}`).update({ moderated: true });
    })
    .then(() => {
      console.log('Marked the image as moderated in the database.');
    });
}

// Blurs uploaded images that are flagged as Adult or Violence.
exports.blurOffensiveImages = functions.storage.object().onFinalize((object) => {
  // Exit if this is a deletion or a deploy event.
  if (object.resourceState === 'not_exists') {
    return console.log('This is a deletion event.');
  } else if (!object.name) {
    return console.log('This is a deploy event.');
  }

  const messageId = object.name.split('/')[1];

  return admin.database().ref(`/messages/${messageId}/moderated`).once('value')
    .then((snapshot) => {
      // The image has already been moderated.
      if (snapshot.val()) {
        return;
      }

      // Check the image content using the Cloud Vision API.
      return visionClient.safeSearchDetection(`gs://${object.bucket}/${object.name}`);
    })
    .then((results) => {
      if (!results) {
        return;
      }
      const detections = results[0].safeSearchAnnotation;
      if (detections.adult || detections.violence) {
        console.log('The image', object.name, 'has been detected as inappropriate.');
        return blurImage(object);
      } else {
        console.log('The image', object.name, ' has been detected as OK.');
      }
    });
});


// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.database.ref('/messages/{messageId}').onWrite((change, context) => {
  // Only send a notification when a message has been created.
  if (change.before.val()) {
    return;
  }

  // Notification details.
  const original = change.after.val();
  const text = original.text;
  const payload = {
    notification: {
      title: `${original.name} posted ${text ? 'a message' : 'an image'}`,
      body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
      icon: original.photoUrl || '/assets/images/profile_placeholder.png',
      click_action: `https://${functions.config().firebase.authDomain}`
    }
  };

  // Get the list of device tokens.
  return admin.database().ref('fcmTokens').once('value').then(allTokens => {
    if (allTokens.val()) {
      // Listing all tokens.
      const tokens = Object.keys(allTokens.val());

      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(allTokens.ref.child(tokens[index]).remove());
            }
          }
        });
        return Promise.all(tokensToRemove);
      });
    }
  });
});

// Annotates messages using the Cloud Natural Language API
exports.annotateMessages = functions.database.ref('/messages/{messageId}').onWrite((change, context) => {
  const messageId = context.params.messageId;

  // Only annotate new messages.
  if (change.before.exists()) {
    return null;
  }

  // Annotation arguments.
  const original = change.after.val();
  const request = {
    document: {
      content: original.text,
      type: 'PLAIN_TEXT'
    },
    features: {
      extractDocumentSentiment: true,
      extractEntities: true
    }
  };

  console.log('Annotating new message.');

  // Detect the sentiment and entities of the new message.
  return languageClient.annotateText(request)
    .then((result) => {
      console.log('Saving annotations.');

      // Update the message with the results.
      return admin.database().ref(`/messages/${messageId}`).update({
        sentiment: result[0].documentSentiment,
        entities: result[0].entities.map((entity) => {
          return {
            name: entity.name,
            salience: entity.salience
          };
        })
      });
    });
});

