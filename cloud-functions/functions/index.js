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
admin.initializeApp();
const Vision = require('@google-cloud/vision');
const vision = new Vision.ImageAnnotatorClient();
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const path = require('path');
const os = require('os');
const fs = require('fs');

// Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
  functions.logger.log('A new user signed in for the first time.');
  const fullName = user.displayName || 'Anonymous';

  // Saves the new welcome message into the database
  // which then displays it in the FriendlyChat clients.
  await admin.firestore().collection('messages').add({
    name: 'Firebase Bot',
    profilePicUrl: '/images/firebase-logo.png', // Firebase logo
    text: `${fullName} signed in for the first time! Welcome!`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  functions.logger.log('Welcome message written to database.');
});

// Checks if uploaded images are flagged as Adult or Violence and if so blurs them.
exports.blurOffensiveImages = functions.runWith({memory: '2GB'}).storage.object().onFinalize(
    async (object) => {
      const imageUri = `gs://${object.bucket}/${object.name}`;

      // Check the image content using the Cloud Vision API.
      const batchAnnotateImagesResponse = await vision.safeSearchDetection(imageUri);
      const safeSearchResult = batchAnnotateImagesResponse[0].safeSearchAnnotation;
      const Likelihood = Vision.protos.google.cloud.vision.v1.Likelihood;
      if (Likelihood[safeSearchResult.adult] >= Likelihood.LIKELY ||
          Likelihood[safeSearchResult.violence] >= Likelihood.LIKELY) {
        functions.logger.log('The image', object.name, 'has been detected as inappropriate.');
        return blurImage(object.name);
      }
      functions.logger.log('The image', object.name, 'has been detected as OK.');
    });

// Blurs the given image located in the given bucket using ImageMagick.
async function blurImage(filePath) {
  const tempLocalFile = path.join(os.tmpdir(), path.basename(filePath));
  const messageId = filePath.split(path.sep)[1];
  const bucket = admin.storage().bucket();

  // Download file from bucket.
  await bucket.file(filePath).download({destination: tempLocalFile});
  functions.logger.log('Image has been downloaded to', tempLocalFile);
  // Blur the image using ImageMagick.
  await exec(`convert "${tempLocalFile}" -channel RGBA -blur 0x24 "${tempLocalFile}"`);
  functions.logger.log('Image has been blurred');
  // Uploading the Blurred image back into the bucket.
  await bucket.upload(tempLocalFile, {destination: filePath});
  functions.logger.log('Blurred image has been uploaded to', filePath);
  // Deleting the local file to free up disk space.
  fs.unlinkSync(tempLocalFile);
  functions.logger.log('Deleted local file.');
  // Indicate that the message has been moderated.
  await admin.firestore().collection('messages').doc(messageId).update({moderated: true});
  functions.logger.log('Marked the image as moderated in the database.');
}

// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.firestore.document('messages/{messageId}').onCreate(
  async (snapshot) => {
    // Notification details.
    const text = snapshot.data().text;
    const payload = {
      notification: {
        title: `${snapshot.data().name} posted ${text ? 'a message' : 'an image'}`,
        body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
        icon: snapshot.data().profilePicUrl || '/images/profile_placeholder.png',
        click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
      }
    };

    // Get the list of device tokens.
    const allTokens = await admin.firestore().collection('fcmTokens').get();
    const tokens = [];
    allTokens.forEach((tokenDoc) => {
      tokens.push(tokenDoc.id);
    });

    if (tokens.length > 0) {
      // Send notifications to all tokens.
      const response = await admin.messaging().sendToDevice(tokens, payload);
      await cleanupTokens(response, tokens);
      functions.logger.log('Notifications have been sent and tokens cleaned up.');
    }
  });

// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
  // For each notification we check if there was an error.
  const tokensDelete = [];
  response.results.forEach((result, index) => {
    const error = result.error;
    if (error) {
      functions.logger.error('Failure sending notification to', tokens[index], error);
      // Cleanup the tokens who are not registered anymore.
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        const deleteTask = admin.firestore().collection('fcmTokens').doc(tokens[index]).delete();
        tokensDelete.push(deleteTask);
      }
    }
  });
  return Promise.all(tokensDelete); 
}
