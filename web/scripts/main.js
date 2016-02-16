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
'use strict';

// Project configuration static initializers.
// TODO(DEVELOPER): Change these config variables.
var DATABASE_URL = '<DATABASE_URL>';
var API_KEY = '<API_KEY>';

// Initializes FriendlyChat.
function FriendlyChat() {

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  this.initFirebase(API_KEY, DATABASE_URL);
  this.loadMessages();
}

// Initializes Firebase.
FriendlyChat.prototype.initFirebase = function(apiKey, databaseUrl) {
  var fbConfig = {
    apiKey: apiKey,
    databaseUrl: databaseUrl
  };
  this.app = firebase.App.initialize(fbConfig);
  this.database = firebase.database();
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesDbRef = this.database.ref().child('messages');
  // Make sure we remove all previous listeners.
  this.messagesDbRef.off();

  // Loads the last 12 messages and listen for new ones.
  this.messagesDbRef.limitToLast(12).on('child_added', function(data) {
    var val = data.val();
    this.displayMessage(data.key(), val.name, val.text, val.photoUrl);
  }.bind(this));
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.app.auth().currentUser();
    this.messagesDbRef.push({
      name: currentUser ? currentUser.displayName : 'Anonymous',
      text: this.messageInput.value,
      photoUrl: currentUser ? currentUser.photoUrl : null
    }).then(function() {
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function(googleUser) {
  this.googleUser = googleUser;
  var profile = googleUser.getBasicProfile();
  // Toggle UI.
  if (profile.getImageUrl()) {
    this.userPic.style.backgroundImage = 'url(' + profile.getImageUrl() + ')';
  }
  if (profile.getName()) {
    this.userName.textContent = profile.getName();
  }
  this.userName.removeAttribute('hidden');
  this.userPic.removeAttribute('hidden');
  this.signInButton.setAttribute('hidden', true);
  this.signOutButton.removeAttribute('hidden');

  // Sign in Firebase with credential from the Google user.
  var credential = firebase.GoogleAuthProvider.credential({
    'idToken' : googleUser.getAuthResponse().id_token
  });
  this.app.auth().signInWithCredential(credential).then(function() {
    this.loadMessages();
  }.bind(this), function(error) {
    console.log('Error signing in Firebase', error);
  }.bind(this));
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  if (this.googleUser) {
    this.googleUser.disconnect();
    this.googleUser = null;
    // Toggle the signed-in user info widget.
    this.userName.setAttribute('hidden', true);
    this.userPic.setAttribute('hidden', true);
    this.signOutButton.setAttribute('hidden', true);
    this.signInButton.removeAttribute('hidden');

    // Sign out of Firebase.
    this.app.auth().signOut();
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  if (this.app.auth().currentUser()) {
    return true;
  } else {
    // Display a message to the user using a Toast.
    var data = {
      message: 'You must sign-in first',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return false;
  }
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="pic"></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, message, picUrl) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  messageElement.textContent = message;
  // Replace all line breaks by <br>.
  messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

window.FC = new FriendlyChat();
window.signIn = window.FC.signIn.bind(window.FC);
