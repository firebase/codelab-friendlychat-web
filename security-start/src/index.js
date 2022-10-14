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

import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  connectAuthEmulator,
  getMultiFactorResolver,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  connectStorageEmulator,
} from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

import { getFirebaseConfig } from "./firebase-config.js";

// Signs-in Friendly Chat.
async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider)
    .then(function (userCredential) {
      // User successfully signed in and is not enrolled with a second factor.
    })
    .catch(function (error) {
      if (error.code == "auth/multi-factor-auth-required") {
        alert(`MFA is required. ${error}`);

        // TODO 2: Remove the alert above and uncomment the following code block
        // to handle MFA sign in.

        // // The user is a multi-factor user. Second factor challenge is required.
        // multiFactorResolver = getMultiFactorResolver(getAuth(), error);
        // displaySecondFactor(multiFactorResolver.hints);
      } else {
        alert(`Error signing in user. ${error}`);
      }
    });
}

// Starts MFA sign in flow by sending a verification code to the user.
async function startMultiFactorSignIn(multiFactorHint, session) {
  if (multiFactorHint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha",
      { size: "invisible" },
      getAuth()
    );
    const phoneInfoOptions = { multiFactorHint, session };
    const phoneAuthProvider = new PhoneAuthProvider(getAuth());
    // Send SMS verification code
    verificationId = await phoneAuthProvider
      .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
      .catch(function (error) {
        alert(`Error verifying phone number. ${error}`);
        throw error;
      });
  } else {
    alert("Only phone number second factors are supported.");
  }
}

// Completes MFA sign in flow once verification code is obtained.
async function finishMultiFactorSignIn(verificationCode) {
  // Get SMS verification code sent to user.
  const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

  // Complete sign-in.
  await multiFactorResolver
    .resolveSignIn(multiFactorAssertion)
    .catch(function (error) {
      alert(`Error completing sign in. ${error}`);
      throw error;
    });

  multiFactorResolver = null;
  verificationId = null;
}

// Starts MFA enrollment for phone number provider by sending a verification code to the user.
async function startEnrollMultiFactor(phoneNumber) {
  // TODO 1: Uncomment the following code block, which is necessary for MFA
  // enrollment.

  // const recaptchaVerifier = new RecaptchaVerifier(
  //   "recaptcha",
  //   { size: "invisible" },
  //   getAuth()
  // );

  // verificationId = await multiFactor(getAuth().currentUser)
  //   .getSession()
  //   .then(function (multiFactorSession) {
  //     // Specify the phone number and pass the MFA session.
  //     const phoneInfoOptions = {
  //       phoneNumber: phoneNumber,
  //       session: multiFactorSession,
  //     };

  //     const phoneAuthProvider = new PhoneAuthProvider(getAuth());

  //     // Send SMS verification code.
  //     return phoneAuthProvider.verifyPhoneNumber(
  //       phoneInfoOptions,
  //       recaptchaVerifier
  //     );
  //   })
  //   .catch(function (error) {
  //     if (error.code == "auth/invalid-phone-number") {
  //       alert(
  //         `Error with phone number formatting. Phone numbers must start with +. ${error}`
  //       );
  //     } else {
  //       alert(`Error enrolling second factor. ${error}`);
  //     }
  //     throw error;
  //   });
}

// Completes MFA enrollment once verification code is obtained.
async function finishEnrollMultiFactor(verificationCode) {
  // TODO 1: Uncomment the following code block, which is necessary for MFA
  // enrollment.

  // // Ask user for the verification code. Then:
  // const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
  // const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

  // // Complete enrollment.
  // await multiFactor(getAuth().currentUser)
  //   .enroll(multiFactorAssertion)
  //   .catch(function (error) {
  //     alert(`Error finishing second factor enrollment. ${error}`);
  //     throw error;
  //   });
  // verificationId = null;
}

// Signs-out of Friendly Chat.
async function signOutUser() {
  // Sign out of Firebase.
  await signOut(getAuth());
  await saveMember();
}

// Initialize firebase auth
function initFirebaseAuth() {
  // Listen to auth state changes.
  onAuthStateChanged(getAuth(), authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return getAuth().currentUser.photoURL || "/images/profile_placeholder.png";
}

// Returns the signed-in user's display name.
function getUserName() {
  return getAuth().currentUser.displayName || getAuth().currentUser.email;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!getAuth().currentUser;
}

// Saves a new message to Cloud Firestore.
async function saveMessage(messageText) {
  // Add a new message entry to the Firebase database.
  try {
    await addDoc(
      collection(getFirestore(), `chatrooms/${selectedRoom}/messages`),
      {
        name: getUserName(),
        text: messageText,
        profilePicUrl: getProfilePicUrl(),
        timestamp: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error("Error writing new message to Firebase Database", error);
  }
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages(messageListElementType) {
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(
    collection(getFirestore(), `chatrooms/${selectedRoom}/messages`),
    orderBy("timestamp", "desc"),
    limit(12)
  );

  // Start listening to the query.
  onSnapshot(recentMessagesQuery, function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === "removed") {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(
          change.doc.id,
          message.timestamp,
          message.name,
          message.text,
          message.profilePicUrl,
          message.imageUrl,
          messageListElementType
        );
      }
    });
  });
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
async function saveImageMessage(file) {
  try {
    // 1 - We add a message with a loading icon that will get updated with the shared image.
    const messageRef = await addDoc(
      collection(getFirestore(), `chatrooms/${selectedRoom}/messages`),
      {
        name: getUserName(),
        imageUrl: LOADING_IMAGE_URL,
        profilePicUrl: getProfilePicUrl(),
        timestamp: serverTimestamp(),
      }
    );

    // 2 - Upload the image to Cloud Storage.
    const filePath = `${getAuth().currentUser.uid}/${selectedRoom}/${
      messageRef.id
    }/${file.name}`;
    const newImageRef = ref(getStorage(), filePath);
    const fileSnapshot = await uploadBytesResumable(newImageRef, file);

    // 3 - Generate a public URL for the file.
    const publicImageUrl = await getDownloadURL(newImageRef);

    // 4 - Update the chat message placeholder with the image’s URL.
    await updateDoc(messageRef, {
      imageUrl: publicImageUrl,
      storageUri: fileSnapshot.metadata.fullPath,
    });
  } catch (error) {
    console.error(
      "There was an error uploading a file to Cloud Storage:",
      error
    );
  }
}

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match("image.*")) {
    var data = {
      message: "You can only share images",
      timeout: 2000,
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function () {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

// Triggered when "enroll a second factor" button is clicked.
function displayMfaEnrollment(e) {
  e.preventDefault();

  userSettingsButtonElement.hidden = true;
  signOutButtonElement.hidden = true;

  enrollSecondFactorFormElement.hidden = false;
}

// Triggered when "enroll as second factor" button is clicked.
function startMfaEnrollment(e) {
  e.preventDefault();

  // Check that the user entered a phone number.
  if (phoneNumberElement.value) {
    startEnrollMultiFactor(phoneNumberElement.value).then(function () {
      enrollSecondFactorFormElement.reset();
      enrollSecondFactorFormElement.hidden = true;
      verificationCodeFormElement.hidden = false;
      enrollVerificationCodeSubmitButtonElement.hidden = false;
    });
  }
}

// Triggered when user submits verification code to complete MFA enrollment.
function finishMfaEnrollment(e) {
  e.preventDefault();

  // Check that the user entered a verification number.
  if (verificationCodeElement.value) {
    finishEnrollMultiFactor(verificationCodeElement.value).then(function () {
      verificationCodeFormElement.reset();
      verificationCodeFormElement.hidden = true;
      enrollVerificationCodeSubmitButtonElement.hidden = true;

      userSettingsButtonElement.hidden = false;
      signOutButtonElement.hidden = false;
    });
  }
}

// Display second factor options for current user.
function displaySecondFactor(multiFactorInfoHints) {
  for (var i = 0; i < multiFactorInfoHints.length; i++) {
    const hint = multiFactorInfoHints[i];

    // Create element
    const selection = document.createElement("li");
    selection.textContent = hint.displayName
      ? `${hint.displayName} - ${hint.phoneNumber}`
      : hint.phoneNumber;
    selection.classList.add("mdl-menu__item");

    // Add event listener for each selection
    selection.addEventListener("click", onSelectSecondFactor);

    // Add to second factor drop down menu
    selectSecondFactorDropDownElement.appendChild(selection);
  }

  signInButtonElement.hidden = true;

  selectSecondFactorTextElement.hidden = false;
  selectSecondFactorButtonElement.hidden = false;
  selectSecondFactorElement.hidden = false;
}

// Triggered when multi-factor is selected for sign-in.
async function onSelectSecondFactor(e) {
  e.preventDefault();

  const selectedIndex = Array.prototype.indexOf.call(
    selectSecondFactorDropDownElement.children,
    e.target
  );

  await startMultiFactorSignIn(
    multiFactorResolver.hints[selectedIndex],
    multiFactorResolver.session
  ).then(function () {
    // Hide selection panel
    selectSecondFactorTextElement.hidden = true;
    selectSecondFactorButtonElement.hidden = true;
    selectSecondFactorElement.hidden = true;

    // Display verification code form
    verificationCodeFormElement.hidden = false;
    verificationCodeSubmitButtonElement.hidden = false;

    // Clear list for future sign in's
    while (selectSecondFactorDropDownElement.lastElementChild) {
      selectSecondFactorDropDownElement.removeChild(
        selectSecondFactorDropDownElement.lastElementChild
      );
    }
  });
}

// Triggered when user submits verification code to complete MFA sign in.
function finishMfaSignIn(e) {
  e.preventDefault();

  // Check that the user entered a verification number.
  if (verificationCodeElement.value) {
    finishMultiFactorSignIn(verificationCodeElement.value).then(function () {
      verificationCodeFormElement.reset();
      verificationCodeFormElement.hidden = true;
      verificationCodeSubmitButtonElement.hidden = true;

      userSettingsButtonElement.hidden = false;
      signOutButtonElement.hidden = false;
    });
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) {
    // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage =
      "url(" + addSizeToGoogleProfilePic(profilePicUrl) + ")";
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.hidden = false;
    userPicElement.hidden = false;
    signOutButtonElement.hidden = false;

    // Hide sign-in buttons.
    signInButtonElement.hidden = true;

    // Display user settings hamburger button.
    userSettingsButtonElement.hidden = false;
  } else {
    // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.hidden = true;
    userPicElement.hidden = true;
    signOutButtonElement.hidden = true;

    // Hide user settings hamburger button.
    userSettingsButtonElement.hidden = true;

    // Show sign-in buttons.
    signInButtonElement.hidden = false;
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: "You must sign-in first",
    timeout: 2000,
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = "";
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
var MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  "</div>";

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
    return url + "?sz=150";
  }
  return url;
}

// A loading image URL.
var LOADING_IMAGE_URL = "https://www.google.com/images/spin-32.gif?a";

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function createAndInsertMessage(id, timestamp, messageListElementType) {
  const container = document.createElement("div");
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute("id", id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute("timestamp", timestamp);

  // figure out where to insert new message
  const existingMessages = messageListElementType.children;
  if (existingMessages.length === 0) {
    messageListElementType.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute("timestamp");

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElementType.insertBefore(div, messageListNode);
  }

  return div;
}

// Displays a Message in the UI.
function displayMessage(
  id,
  timestamp,
  name,
  text,
  picUrl,
  imageUrl,
  messageListElementType
) {
  var div =
    document.getElementById(id) ||
    createAndInsertMessage(id, timestamp, messageListElementType);

  // profile picture
  if (picUrl) {
    div.querySelector(".pic").style.backgroundImage =
      "url(" + addSizeToGoogleProfilePic(picUrl) + ")";
  }

  div.querySelector(".name").textContent = name;
  var messageElement = div.querySelector(".message");

  if (text) {
    // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, "<br>");
  } else if (imageUrl) {
    // If the message is an image.
    var image = document.createElement("img");
    image.addEventListener("load", function () {
      messageListElementType.scrollTop = messageListElementType.scrollHeight;
    });
    image.src = imageUrl + "&" + new Date().getTime();
    messageElement.innerHTML = "";
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () {
    div.classList.add("visible");
  }, 1);
  messageListElementType.scrollTop = messageListElementType.scrollHeight;
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute("disabled");
  } else {
    submitButtonElement.setAttribute("disabled", "true");
  }
}

//onclick event for public room button and private room button
function onClickPublicRoom() {
  selectedRoom = "publicRoom";
  messageListElement.hidden = false;
  privateMessageListElement.hidden = true;
  loadMessages(messageListElement);
  saveMember();
}

function onClickPrivateRoom() {
  selectedRoom = "privateRoom";
  privateMessageListElement.hidden = false;
  messageListElement.hidden = true;
  loadMessages(privateMessageListElement);
  saveMember();
}

async function saveMember() {
  messageCardElement.hidden = true;
  privatePermissionErrorElement.hidden = true;
  // Add a new member to selected chatroom.
  if (isUserSignedIn()) {
    notSignedInErrorElement.hidden = true;
    try {
      const memberUid = getAuth().currentUser.uid;
      await setDoc(
        doc(getFirestore(), `chatrooms/${selectedRoom}/members/${memberUid}`),
        {
          uid: memberUid,
          email: getAuth().currentUser.email,
        }
      );
      messageCardElement.hidden = false;
    } catch (error) {
      if (error) {
        privatePermissionErrorElement.hidden = false;
        messageCardElement.hidden = true;
      }
      console.error("Error adding new member to Firestore", error);
    }
  } else {
    notSignedInErrorElement.hidden = false;
  }
}

// Used in multi-factor sign in flow.
var multiFactorResolver = null;
// Used in multi-factor enrollment and sign in flows.
var verificationId = null;

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById("messages");
var privateMessageListElement = document.getElementById("private-messages");
var messageFormElement = document.getElementById("message-form");
var messageInputElement = document.getElementById("message");
var submitButtonElement = document.getElementById("submit");
var imageButtonElement = document.getElementById("submitImage");
var imageFormElement = document.getElementById("image-form");
var mediaCaptureElement = document.getElementById("mediaCapture");
var userPicElement = document.getElementById("user-pic");
var userNameElement = document.getElementById("user-name");
var signInButtonElement = document.getElementById("sign-in");
var signOutButtonElement = document.getElementById("sign-out");
var signInSnackbarElement = document.getElementById("must-signin-snackbar");
var publicRoomButtonElement = document.getElementById("public-room");
var privateRoomButtonElement = document.getElementById("private-room");
var messageCardElement = document.getElementById("messages-card-container");
var notSignedInErrorElement = document.getElementById(
  "mdl-not-signed-in-error-container"
);
var privatePermissionErrorElement = document.getElementById(
  "mdl-no-permission-error-container"
);
var userSettingsButtonElement = document.getElementById("user-settings");
var startEnrollSecondFactorElement = document.getElementById(
  "start-enroll-second-factor"
);
var phoneNumberElement = document.getElementById("phone-number");
var enrollSecondFactorFormElement = document.getElementById(
  "enroll-second-factor-form"
);
var enrollSecondFactorSubmitButtonElement = document.getElementById(
  "enroll-second-factor-submit"
);
var selectSecondFactorTextElement = document.getElementById(
  "select-second-factor-text"
);
var selectSecondFactorButtonElement = document.getElementById(
  "select-second-factor-button"
);
const selectSecondFactorElement = document.getElementById(
  "select-second-factor"
);
var selectSecondFactorDropDownElement = document.getElementById(
  "select-second-factor-drop-down"
);
var verificationCodeFormElement = document.getElementById(
  "verification-code-form"
);
var verificationCodeElement = document.getElementById("verification-code");
var enrollVerificationCodeSubmitButtonElement = document.getElementById(
  "enroll-verification-code-submit"
);
var verificationCodeSubmitButtonElement = document.getElementById(
  "verification-code-submit"
);

//state of selectd room that will be updated when room button is collected.
var selectedRoom = "publicRoom";

// Buttons for sign in and sign out.
signOutButtonElement.addEventListener("click", signOutUser);
signInButtonElement.addEventListener("click", signIn);

// Buttons for MFA flows.
startEnrollSecondFactorElement.addEventListener("click", displayMfaEnrollment);
enrollSecondFactorSubmitButtonElement.addEventListener(
  "click",
  startMfaEnrollment
);
enrollVerificationCodeSubmitButtonElement.addEventListener(
  "click",
  finishMfaEnrollment
);
verificationCodeSubmitButtonElement.addEventListener("click", finishMfaSignIn);

// Toggle for the button.
messageInputElement.addEventListener("keyup", toggleButton);
messageInputElement.addEventListener("change", toggleButton);

//Event for message submission.
messageFormElement.addEventListener("submit", onMessageFormSubmit);

// Events for image upload.
imageButtonElement.addEventListener("click", function (e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener("change", onMediaFileSelected);

//Events for public room and private room button
publicRoomButtonElement.addEventListener("click", onClickPublicRoom);
privateRoomButtonElement.addEventListener("click", onClickPrivateRoom);

const firebaseApp = initializeApp(getFirebaseConfig());
connectAuthEmulator(getAuth(), "http://localhost:9199");
connectFunctionsEmulator(getFunctions(), "localhost", 5011);
connectFirestoreEmulator(getFirestore(), "localhost", 8080);
connectStorageEmulator(getStorage(), "localhost", 9139);

initFirebaseAuth();
