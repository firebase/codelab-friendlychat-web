/**
 * Copyright 2015 Google Inc. All Rights Reserved.
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

"use strict";

// ----------------- Helper Variables -----------------
const LOADING_IMAGE_URL = "https://www.google.com/images/spin-32.gif?a";
const MESSAGE_TEMPLATE = `<div class="message-container">
    <div class="spacing"><div class="pic"></div></div>
    <div class="message"></div>
    <div class="name"></div>
  </div>`;

// ----------------- DOM Elements -----------------
const messageListElement = document.getElementById("messages");
const messageFormElement = document.getElementById("message-form");
const messageInputElement = document.getElementById("message");
const submitButtonElement = document.getElementById("submit");
const imageButtonElement = document.getElementById("submitImage");
const imageFormElement = document.getElementById("image-form");
const mediaCaptureElement = document.getElementById("mediaCapture");
const userPicElement = document.getElementById("user-pic");
const userNameElement = document.getElementById("user-name");
const signInButtonElement = document.getElementById("sign-in");
const signOutButtonElement = document.getElementById("sign-out");
const signInSnackbarElement = document.getElementById("must-signin-snackbar");

// ----------------- Firebase Auth -----------------

const signIn = async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
  } catch (error) {
    console.error("Error during sign-in:", error);
  }
};

const signOut = async () => {
  try {
    await firebase.auth().signOut();
  } catch (error) {
    console.error("Error during sign-out:", error);
  }
};

// Triggered when the auth state changes (user signs-in/signs-out).
const authStateObserver = (user) => {
  if (user) {
    // User is signed in
    const profilePicUrl = getProfilePicUrl();
    const userName = getUserName();

    // Set the user's profile picture and display name
    userPicElement.style.backgroundImage = `url(${addSizeToGoogleProfilePic(
      profilePicUrl
    )})`;
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button
    userNameElement.removeAttribute("hidden");
    userPicElement.removeAttribute("hidden");
    signOutButtonElement.removeAttribute("hidden");

    // Hide the sign-in button
    signInButtonElement.setAttribute("hidden", "true");

    // Save the Firebase Messaging Device token and enable notifications
    saveMessagingDeviceToken();
  } else {
    // User is signed out
    // Hide user's profile and sign-out button
    userNameElement.setAttribute("hidden", "true");
    userPicElement.setAttribute("hidden", "true");
    signOutButtonElement.setAttribute("hidden", "true");

    // Show the sign-in button
    signInButtonElement.removeAttribute("hidden");
  }
};

const initFirebaseAuth = () => {
  firebase.auth().onAuthStateChanged(authStateObserver);
};

const getProfilePicUrl = () =>
  firebase.auth().currentUser?.photoURL || "/images/profile_placeholder.png";

const getUserName = () => firebase.auth().currentUser?.displayName;

const isUserSignedIn = () => !!firebase.auth().currentUser;

// ----------------- Load Messages -----------------

const loadMessages = () => {
  const query = firebase
    .firestore()
    .collection("messages")
    .orderBy("timestamp", "asc")
    .limitToLast(12);

  query.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "removed") {
        deleteMessage(change.doc.id);
      } else {
        const message = change.doc.data();
        displayMessage(
          change.doc.id,
          message.timestamp,
          message.name,
          message.text,
          message.profilePicUrl,
          message.imageUrl
        );
      }
    });
  });
};

// ----------------- Save Messages -----------------

const saveMessage = async (messageText) => {
  try {
    await firebase.firestore().collection("messages").add({
      name: getUserName(),
      text: messageText,
      profilePicUrl: getProfilePicUrl(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error writing new message to Firebase Database:", error);
  }
};

const saveImageMessage = async (file) => {
  try {
    const messageRef = await firebase.firestore().collection("messages").add({
      name: getUserName(),
      imageUrl: LOADING_IMAGE_URL,
      profilePicUrl: getProfilePicUrl(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const filePath = `${firebase.auth().currentUser.uid}/${messageRef.id}/${
      file.name
    }`;
    const fileSnapshot = await firebase.storage().ref(filePath).put(file);
    const url = await fileSnapshot.ref.getDownloadURL();

    await messageRef.update({
      imageUrl: url,
      storageUri: fileSnapshot.metadata.fullPath,
    });
  } catch (error) {
    console.error(
      "There was an error uploading a file to Cloud Storage:",
      error
    );
  }
};

// ----------------- Notifications -----------------

const saveMessagingDeviceToken = async () => {
  try {
    const currentToken = await firebase.messaging().getToken();

    if (currentToken) {
      console.log("Got FCM device token:", currentToken);

      await firebase
        .firestore()
        .collection("fcmTokens")
        .doc(currentToken)
        .set({ uid: firebase.auth().currentUser.uid, token: currentToken });
    } else {
      requestNotificationsPermissions();
    }
  } catch (error) {
    console.error("Unable to get messaging token.", error);
  }
};

const requestNotificationsPermissions = async () => {
  console.log("Requesting notifications permission...");

  try {
    await firebase.messaging().requestPermission();
    saveMessagingDeviceToken();
  } catch (error) {
    console.error("Unable to get permission to notify:", error);
  }
};

// ----------------- UI Helpers -----------------

const deleteMessage = (id) => {
  const div = document.getElementById(id);
  if (div) div.parentNode.removeChild(div);
};

const createAndInsertMessage = (id, timestamp = Date.now()) => {
  const container = document.createElement("div");
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute("id", id);
  div.setAttribute("timestamp", timestamp);

  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = parseInt(
        messageListNode.getAttribute("timestamp"),
        10
      );

      if (messageListNodeTime > timestamp) break;

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
};

const displayMessage = (id, timestamp, name, text, picUrl, imageUrl) => {
  const div =
    document.getElementById(id) || createAndInsertMessage(id, timestamp);

  if (picUrl) {
    div.querySelector(
      ".pic"
    ).style.backgroundImage = `url(${addSizeToGoogleProfilePic(picUrl)})`;
  }

  div.querySelector(".name").textContent = name;
  const messageElement = div.querySelector(".message");

  if (text) {
    messageElement.textContent = text.replace(/\n/g, "<br>");
  } else if (imageUrl) {
    const image = document.createElement("img");
    image.src = `${imageUrl}&${new Date().getTime()}`;
    image.addEventListener("load", () => {
      messageListElement.scrollTop = messageListElement.scrollHeight;
    });
    messageElement.innerHTML = "";
    messageElement.appendChild(image);
  }

  setTimeout(() => div.classList.add("visible"), 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
};

const toggleButton = () => {
  submitButtonElement.disabled = !messageInputElement.value;
};

const addSizeToGoogleProfilePic = (url) => {
  return url.includes("googleusercontent.com") && !url.includes("?")
    ? `${url}?sz=150`
    : url;
};

// ----------------- Initialize -----------------

const checkSetup = () => {
  if (
    !window.firebase ||
    !(firebase.app instanceof Function) ||
    !firebase.app().options
  ) {
    window.alert(
      "You have not configured and imported the Firebase SDK. " +
        "Make sure you go through the codelab setup instructions and " +
        "run the codelab using `firebase serve`."
    );
  }
};

// Checks that Firebase has been imported.
checkSetup();

// initialize Firebase
initFirebaseAuth();

// We load currently existing chat messages and listen to new ones.
loadMessages();

// ----------------- Event Listeners -----------------

messageFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (messageInputElement.value && isUserSignedIn()) {
    await saveMessage(messageInputElement.value);
    messageInputElement.value = "";
    toggleButton();
  } else {
    console.warn("User must sign-in to send messages.");
  }
});

signInButtonElement.addEventListener("click", signIn);
signOutButtonElement.addEventListener("click", signOut);

imageButtonElement.addEventListener("click", (e) => {
  e.preventDefault();
  mediaCaptureElement.click();
});

mediaCaptureElement.addEventListener("change", async (e) => {
  e.preventDefault();

  const file = e.target.files[0];
  imageFormElement.reset();

  if (!file.type.startsWith("image/")) {
    console.warn("You can only share images.");
    return;
  }

  if (isUserSignedIn()) {
    saveImageMessage(file);
  }
});

messageInputElement.addEventListener("keyup", toggleButton);
messageInputElement.addEventListener("change", toggleButton);
