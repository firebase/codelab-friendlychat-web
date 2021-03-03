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

// Firebase setup
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Node.js core modules
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const path = require('path');
const os = require('os');

// Vision API
const vision = require('@google-cloud/vision');

// Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
  functions.logger.log('A new user signed in for the first time.');
  const fullName = user.displayName || 'Anonymous';

  // Saves the new welcome message into the database
  // which then displays it in the FriendlyChat clients.
  await admin
    .firestore()
    .collection('messages')
    .add({
      name: 'Firebase Bot',
      profilePicUrl: '/images/firebase-logo.png', // Firebase logo
      text: `${fullName} signed in for the first time! Welcome!`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  functions.logger.log('Welcome message written to database.');
});

// Checks if uploaded images are flagged as Adult or Violence and if so blurs them.
exports.blurOffensiveImages = functions
  .runWith({ memory: '2GB' })
  .storage.object()
  .onFinalize(async (object) => {
    // Generate a Cloud Storage URI for the image
    const imageUri = `gs://${object.bucket}/${object.name}`;

    // Check the image content using the Cloud Vision API.
    const visionClient = new vision.ImageAnnotatorClient();
    const data = await visionClient.safeSearchDetection(imageUri);
    const safeSearchResult = data[0].safeSearchAnnotation;
    functions.logger.log(
      `SafeSearch results on image "${object.name}"`,
      safeSearchResult
    );

    // Tune these detection likelihoods to suit your app.
    // The current settings show the most strict configuration
    // Available likelihoods are defined in https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#likelihood
    if (
      safeSearchResult.adult !== 'VERY_UNLIKELY' ||
      safeSearchResult.violence !== 'VERY_UNLIKELY'
    ) {
      functions.logger.log(
        `Image ${object.name} has been detected as inappropriate.`
      );
      return blurImage(object.name, object.bucket, object.metadata);
    }

    functions.logger.log(`Image ${object.name} has been detected as OK.`);
  });

// Blurs the given image located in the given bucket using ImageMagick.
async function blurImage(filePath, bucketName, metadata) {
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const bucket = admin.storage().bucket(bucketName);
  const messageId = filePath.split(path.sep)[1];

  // Download file from bucket.
  await bucket.file(filePath).download({ destination: tempLocalFile });
  functions.logger.log('Image has been downloaded to', tempLocalFile);

  // Blur the image using ImageMagick.
  await exec(
    `convert "${tempLocalFile}" -channel RGBA -blur 0x8 "${tempLocalFile}"`
  );
  functions.logger.log('Image has been blurred');

  // Uploading the Blurred image back into the bucket.
  await bucket.upload(tempLocalFile, {
    destination: filePath,
    metadata: { metadata: metadata }, // Keeping custom metadata.
  });
  functions.logger.log('Blurred image has been uploaded to', filePath);

  // Delete the local file to free up disk space.
  fs.unlinkSync(tempLocalFile);
  functions.logger.log('Deleted local file.');

  // Indicate that the message has been moderated.
  await admin
    .firestore()
    .collection('messages')
    .doc(messageId)
    .update({ moderated: true });
  functions.logger.log('Marked the image as moderated in the database.');
}

// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snapshot) => {
    // Notification details.
    const text = snapshot.data().text;
    const payload = {
      notification: {
        title: `${snapshot.data().name} posted ${
          text ? 'a message' : 'an image'
        }`,
        body: text
          ? text.length <= 100
            ? text
            : text.substring(0, 97) + '...'
          : '',
        icon:
          snapshot.data().profilePicUrl || '/images/profile_placeholder.png',
        click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
      },
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
      functions.logger.log(
        'Notifications have been sent and tokens cleaned up.'
      );
    }
  });

// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
  // For each notification we check if there was an error.
  const tokensDelete = [];
  response.results.forEach((result, index) => {
    const error = result.error;
    if (error) {
      functions.logger.error(
        `Failure sending notification to "${tokens[index]}"`,
        error
      );

      // Clean up the tokens who are not registered anymore.
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        const deleteTask = admin
          .firestore()
          .collection('fcmTokens')
          .doc(tokens[index])
          .delete();
        tokensDelete.push(deleteTask);
      }
    }
  });
  return Promise.all(tokensDelete);
}
