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

import { auth, logger, runWith, firestore } from "firebase-functions/v1"; // Firebase Functions
import { initializeApp } from "firebase-admin/app"; // App Initialization
import { getFirestore, FieldValue } from "firebase-admin/firestore"; // Firestore
import { getStorage } from "firebase-admin/storage"; // Firebase Cloud Storage
import { getMessaging } from "firebase-admin/messaging";
import {
  ImageAnnotatorClient,
  protos as visionProtos,
} from "@google-cloud/vision"; // Google Vision API
import { promisify } from "util"; // Node.js Utility for promisifying functions
import { exec as childExec } from "child_process"; // For running shell commands
import path from "path"; // For handling file paths
import os from "os"; // For working with temporary OS files
import fs from "fs"; // File system module

// Initialize Firebase Admin SDK
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Initialize Google Vision API Client
const vision = new ImageAnnotatorClient();
const { Likelihood } = visionProtos.google.cloud.vision.v1; // Helper for likelihood comparison

// Promisify exec for async use
const exec = promisify(childExec);

// ----------------------------
// 1. Welcome Message Function
// ----------------------------
export const addWelcomeMessages = auth.user().onCreate(async (user) => {
  logger.log("A new user signed in for the first time.");
  const fullName = user.displayName || "Anonymous";

  try {
    // Add a welcome message to the "messages" collection
    await db.collection("messages").add({
      name: "Firebase Bot",
      profilePicUrl: "/images/firebase-logo.png",
      text: `${fullName} signed in for the first time! Welcome!`,
      timestamp: FieldValue.serverTimestamp(),
    });
    logger.log("Welcome message written to Firestore successfully.");
  } catch (error) {
    logger.error("Error writing welcome message to Firestore:", error);
  }
});

// ------------------------------------------------
// 2. Blur Offensive Images Function (Storage API)
// ------------------------------------------------
export const blurOffensiveImages = runWith({ memory: "2GB" })
  .storage.object()
  .onFinalize(async (object) => {
    const fileURI = `gs://${object.bucket}/${object.name}`; // Google Cloud Storage URI

    logger.log(`Analyzing image: ${fileURI}`);

    try {
      // Run Vision API's SafeSearch Detection to check for inappropriate content
      const [result] = await vision.safeSearchDetection(fileURI);
      const safeSearchAnnotation = result.safeSearchAnnotation;

      // Check likelihood of adult or violent content
      if (
        Likelihood[safeSearchAnnotation?.adult] >= Likelihood.LIKELY ||
        Likelihood[safeSearchAnnotation?.violence] >= Likelihood.LIKELY
      ) {
        logger.log(
          `The image "${object.name}" has been marked as inappropriate.`
        );
        return blurImage(object.name, object.bucket);
      }

      logger.log(`The image "${object.name}" is safe.`);
      return null;
    } catch (error) {
      logger.error(
        `Error analyzing the image "${object.name}": ${error.message}`
      );
      return null;
    }
  });

// ------------------
// Helper: Blur Image
// ------------------
async function blurImage(filePath, bucketName) {
  const tempLocalFile = path.join(os.tmpdir(), path.basename(filePath)); // Create temp file path
  const bucket = getStorage().bucket(bucketName); // Get bucket reference
  const messageId = filePath.split("/")[1]; // Derive message ID (assuming structure like "messages/{messageId}/{fileName}")

  try {
    // Step 1: Download the file from Firebase Storage
    await bucket.file(filePath).download({ destination: tempLocalFile });
    logger.log(`Image downloaded locally to: "${tempLocalFile}".`);

    // Step 2: Blur the image using ImageMagick
    await exec(
      `convert "${tempLocalFile}" -channel RGBA -blur 0x24 "${tempLocalFile}"`
    );
    logger.log(`Image blurred locally: "${tempLocalFile}".`);

    // Step 3: Upload the blurred image back to Firebase Storage
    await bucket.upload(tempLocalFile, { destination: filePath });
    logger.log(`Blurred image re-uploaded to bucket at path: "${filePath}".`);

    // Step 4: Mark the image as moderated in Firestore
    if (messageId) {
      await db
        .collection("messages")
        .doc(messageId)
        .update({ moderated: true });
      logger.log(`Marked the image "${filePath}" as moderated in Firestore.`);
    } else {
      logger.warn(
        `Could not derive a valid message ID from filePath: "${filePath}". Skipping Firestore update.`
      );
    }
  } catch (error) {
    logger.error(`Error in blurring image "${filePath}":`, error);
  } finally {
    // Step 5: Delete the local temporary file
    if (fs.existsSync(tempLocalFile)) {
      fs.unlinkSync(tempLocalFile);
      logger.log("Temporary local file deleted.");
    }
  }
}

// ---------------------------------------------------
// 3. Send Notifications when New Firestore Data Added
// ---------------------------------------------------
export const sendNotifications = firestore
  .document("messages/{messageId}")
  .onCreate(async (snapshot) => {
    const messageData = snapshot.data();
    const text = messageData.text;

    logger.log("New message detected:", messageData);

    try {
      // Fetch all available FCM tokens from the "fcmTokens" collection
      const allTokensSnapshot = await db.collection("fcmTokens").get();

      const tokens = [];
      allTokensSnapshot.forEach((tokenDoc) => {
        const token = tokenDoc.data().token;
        if (token) {
          tokens.push(token);
        }
      });

      logger.log("Fetched FCM tokens:", tokens);

      if (tokens.length > 0) {
        const responses = await Promise.all(
          tokens.map((token) =>
            messaging.send({
              token: token,
              notification: {
                title: `${messageData.name} posted ${
                  text ? "a message" : "an image"
                }`,
                body: text
                  ? text.length <= 100
                    ? text
                    : text.substring(0, 97) + "..."
                  : "",
                imageUrl:
                  messageData.profilePicUrl ||
                  "/images/profile_placeholder.png",
              },
            })
          )
        );

        logger.log("Send Responses:", responses);

        await cleanupTokens(responses, tokens);
      }
    } catch (error) {
      logger.error("Error sending notifications:", error);
    }
  });

// -------------------
// Helper: Cleanup Tokens
// -------------------
const cleanupTokens = async (responses, tokens) => {
  const tokensDelete = [];

  responses.forEach((res, index) => {
    const error = res.error;
    if (error) {
      logger.error(
        "Failure sending notification to token:",
        tokens[index],
        error
      );

      // Remove invalid or unregistered tokens
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        const tokenDoc = db.collection("fcmTokens").doc(tokens[index]);
        tokensDelete.push(tokenDoc.delete());
      }
    }
  });

  return Promise.all(tokensDelete);
};
