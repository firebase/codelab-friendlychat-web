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

// Initializes FriendlyChat.
function FriendlyChat() {

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.mediaCapture = document.getElementById('mediaCapture');
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

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function() {
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
  this.loadMessages();
}

// Initializes Firebase.
FriendlyChat.prototype.initFirebase = function() {
  this.app = firebase.app();
  this.databaseRef = this.app.database().ref();
  this.storageRef = this.app.storage().ref();
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesDbRef = this.databaseRef.child('messages');
  // Make sure we remove all previous listeners.
  this.messagesDbRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesDbRef.limitToLast(12).on('child_added', setMessage);
  this.messagesDbRef.on('child_changed', setMessage);
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.app.auth().currentUser;
    this.messagesDbRef.push({
      name: currentUser ? currentUser.displayName : 'Anonymous',
      text: this.messageInput.value,
      photoUrl: currentUser ? currentUser.photoURL : null
    }).then(function() {
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (imageUri.indexOf('gs://') == 0) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image in the mean time.
    this.app.storage().refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  var file = event.target.files[0];

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {
    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.app.auth().currentUser;
    this.messagesDbRef.push({
      name: currentUser ? currentUser.displayName : 'Anonymous',
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser ? currentUser.photoURL : null
    }).then(function(data) {

      // Upload the image to Firebase Storage.
      var metadata = {
        'contentType': file.type
      };
      var uid = currentUser ? currentUser.uid : 'Anonymous';
      var uploadTask = this.storageRef.child(uid + '/' + Date.now() + '/' + file.name)
          .put(file, metadata);

      // Listen for upload completion.
      uploadTask.on('state_changed', null, function(error) {
        console.error('There was an error uploading a file to Firebase Storage:', error);
      }, function() {
        var filePath = uploadTask.snapshot.metadata.fullPath;
        console.log('Uploaded file to Firebase Storage. Path:', filePath,
            'Size:', uploadTask.snapshot.totalBytes, 'bytes.');
        console.log(this.storageRef.child(filePath).toString());
        data.update({imageUrl: this.storageRef.child(filePath).toString()});
      }.bind(this));
    }.bind(this));
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

  // Sign in Firebase with credential from the Google user if not already signed-in.
  if (!this.app.auth().currentUser) {
    var credential = firebase.auth.GoogleAuthProvider.credential({
      'idToken' : googleUser.getAuthResponse().id_token
    });
    this.app.auth().signInWithCredential(credential).then(this.loadMessages.bind(this),
        function(error) {
          console.error('Error signing in Firebase', error);
        });
  } else {
    this.loadMessages();
  }
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
  if (this.app.auth().currentUser) {
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
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
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
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
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
