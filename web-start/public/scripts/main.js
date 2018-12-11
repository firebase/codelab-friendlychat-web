//1515061 조해윤

/**
 * Copyright 2018 Google Inc. All Rights Reserved.
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

// Signs-in Friendly Chat.
function signIn() {
  // TODO 1: Sign in Firebase with credential from the Google user.
  //Sign into Firebase using popup auth & Google as the identity provider.

  /**유저 로그인 프로세스 진행 시 2명이 이미 해당 웹사이트에 로그인 하면 더이상 로그인 할 수 없도록 설정 */
  var ref = firebase.database().ref('/users/');
  ref.once("value")
  .then(function(snapshot){
    var test = snapshot.numChildren();
    if(test!=2){
      //현재 사용자 수가 두명이 아니라면 로그인을 진행할 수 있다.
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    }
    else{
      //이미 2명의 유저가 로그인 되어있으므로, 팝업창으로 알리고 로그인을 수행하지 않는다.
      alert("Maximum user logged in");
    }
  });
}

// Signs-out of Friendly Chat.
function signOut() {
  // TODO 2: Sign out of Firebase.
  //Sign out of Firebase

  /* 사용자가 로그아웃 버튼을 누르면 정식 이용자 목록에서 삭제하고 로그아웃 처리를 해준다 */
  deleteUser();
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // TODO 3: Initialize Firebase.
  //Listen to auth state changes
  // 상태 바뀌면 UI 도 변화를 주거나 할 수 있도록
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// 사용자가 메세지를 보낸 시간을 반환
function getTimeStamp(){
  return firebase.database.ServerValue.TIMESTAMP; //한국 시간 기준임
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // TODO 7: Load and listens for new messages.
  //Loads the last 12 messages and listens for new ones.
  var callback = function(snap){
    var data = snap.val();
    displayMessage(snap.key, data.name, data.text, data.profilePicUrl, data.imageUrl, data.timestamp);
  };

  firebase.database().ref('/messages/').limitToLast(12).on('child_added', callback);
  firebase.database().ref('/messages/').limitToLast(12).on('child_changed', callback);

}

// Saves a new message on the Firebase DB.
function saveMessage(messageText) {
  // TODO 8: Push a new message to Firebase.
  //Adds a new message entry to the Realtime Database.
  return firebase.database().ref('/messages/').push({
    name: getUserName(),
    text: messageText,
    profilePicUrl: getProfilePicUrl(),
    timestamp: getTimeStamp()
  }).catch(function(error){
    console.error('Error writing new message to Realtime Database:', error);
  });
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveImageMessage(file) {
  // TODO 9: Posts a new image as a message.
}

// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
  // TODO 10: Save the device token in the realtime datastore
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Save the device token to the Realtime Database.
      firebase.database().ref('/fcmTokens').child(currentToken)
          .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  }).catch(function(error){
    console.error('Unable to get messaging device token:', error);
  });
}

// Requests permissions to show notifications.
function requestNotificationsPermissions() {
  // TODO 11: Request permissions to send notifications.
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    saveMessagingDeviceToken();
  }).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
}

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
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
/* 여주은 */
/* onMessageFormSubmit 수정 */
/* 상대방의 시간이 22시를 넘었거나 7시 이전이면 메시지 보내 않도록 하기 */
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  var myname = getUserName();
  console.log("my name: " + myname);
  var servertime = 0;

  var ref = firebase.database().ref('/.info/serverTimeOffset');
  ref.once('value').then(function stv(data) {
    var isSleeping = true;
    var serverTime = data.val() + Date.now();
    var otheroffset;
    var othername;
    var servertime;
    console.log("servertimestamp: " + serverTime);

    var serverDate = new Date(serverTime);
    var dateParts = serverDate.toString().split(' ');
    var hourmin = dateParts[4].split(':',2);
    /* GMT 00기준 시, 분을 정수로 저장한 변수*/
    /*서버 시간이 한국 기준으로 되어있으므로, GMT 기준으로 변경하기 위해서 9시간을 빼줌*/
    var hour = parseInt(hourmin[0]) - 9;
    if(hour<0) hour=hour+24;
    var min = parseInt(hourmin[1]);
    console.log("GMT hour: " + hour);  //서버시간, GMT 기준

    var ref = firebase.database().ref('/users/');

    ref.on('value', function(snapshot){
      console.log(snapshotToArray(snapshot));
      var userinfo = snapshotToArray(snapshot);

      if(userinfo[0].key != myname){
        otheroffset = userinfo[0].offset.toString();
        othername = userinfo[0].key;
        console.log(otheroffset + "   " + othername);
      }
      else{
        otheroffset = userinfo[1].offset.toString();
        othername = userinfo[1].key;
        console.log(otheroffset + "   " + othername);
      }

      var otheroffsetSplit = otheroffset.split(':');
      var otherHourOffset = parseInt(otheroffsetSplit[0]);

      var otherHour = otherHourOffset + hour;
      console.log("other's hour : " + otherHour);

      if(otherHour >= 22 || otherHour <= 7){
        if(confirm("Too late or too early to send a message to "+ othername + ", Send it?")){
          isSleeping = true;
        }
        else{
          isSleeping = false;
        }
      }
    });
    console.log("send?  " + isSleeping);

    if (messageInputElement.value && checkSignedInWithMessage() && isSleeping) {
      saveMessage(messageInputElement.value).then(function() {
        // Clear message text field and re-enable the SEND button.
        resetMaterialTextfield(messageInputElement);
        toggleButton();
      });
    }
  }, function (err) {
    console.log("err");
  });
}
// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
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
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name1"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Displays a Message in the UI.
function displayMessage(key, name, text, picUrl, imageUrl, timestamp) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    messageListElement.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }

  //덧붙인 코드
  var myDate = new Date(timestamp);
  var dateParts = myDate.toString().split(' ');
  var hourmin = dateParts[4].split(':',2);
  /* GMT 00기준 시, 분을 정수로 저장한 변수*/
  /*서버 시간이 한국 기준으로 되어있으므로, GMT 기준으로 변경하기 위해서 9시간을 빼줌*/
  var hour = parseInt(hourmin[0]) - 9;
  if(hour<0) hour=hour+24;
  var min = parseInt(hourmin[1]);

  /* Firebase 데이터베이스에서 본인 시간 offset을 가져오고 계산 */
  var userOffset;
  var otherOffset;

  /*배열로 user 정보 한꺼번에 다 가져와서 본인과 상대방 시간대 동시에 계산*/
  firebase.database().ref('/users').on('value', function(snapshot){
    console.log(snapshotToArray(snapshot));
    var userinfo= snapshotToArray(snapshot);

    if(userinfo[0].key == name){
      userOffset=userinfo[0].offset.toString();
      otherOffset=userinfo[1].offset.toString();
    }
    else{
      userOffset=userinfo[1].offset.toString();
      otherOffset=userinfo[0].offset.toString();
    }

    var uOffsetsplit = userOffset.split(':');
    var oOffsetsplit = otherOffset.split(':');
    var uHourOffset = parseInt(uOffsetsplit[0]);
    var uMinOffset= parseInt(uOffsetsplit[1]);
    var oHourOffset = parseInt(oOffsetsplit[0]);
    var oMinOffset = parseInt(oOffsetsplit[1]);

    console.log("GMT 기준 시간:"+hour+":"+min);
    //myHour의 경우, hourOffset에 앞에 +가 있으면 양수, 없으면 음수로 자동 변환 되기 때문에
    //그냥 더해주면 되지만, myMin같은 경우에는 알 길이 없으므로, hourOffset값이 양수인지 음수인지에 따라서
    //덧셈을 할 지 뺄셈을 할지 정해주고 계산을 하면 됩니다.

    var myHour = hour + uHourOffset;
    if(myHour<0) myHour+=24;
    if(uHourOffset<0) uMinOffset=uMinOffset*(-1);
    var myMin = min + uMinOffset;

    var otherHour = hour + oHourOffset;
    if(otherHour<0) otherHour+=24;
    if(oHourOffset<0) oMinOffset=oMinOffset*(-1);
    var otherMin = min + oMinOffset;

    console.log("시간 계산 후 나의 시간->" + myHour + ":" + myMin);
    console.log("시간 계산 후 상대방 시간-> "+otherHour+":"+otherMin);
    /* 메세지 시간 표시하는 부분 */
    div.querySelector('.name1').textContent = name;
    div.querySelector('.name').textContent = myHour+":"+myMin +" 보냄\n"+ otherHour+":"+otherMin+" 받음";
  }, function(error){
    console.log("Error: "+error.code);
  }

);

  var messageElement = div.querySelector('.message');

  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUrl) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      messageListElement.scrollTop = messageListElement.scrollHeight;
    });
    image.src = imageUrl + '&' + new Date().getTime();
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Checks that Firebase has been imported.
checkSetup();

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// Events for image upload.
imageButtonElement.addEventListener('click', function(e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

// initialize Firebase
initFirebaseAuth();

// We load currently existing chat messages and listen to new ones.
loadMessages();


//TimeZone 받아오는 코드 추가 부분
//사용자 목록도 추가한다.
function register() { //confirm 버튼 눌리면 실행되는 함수
  var obj = document.getElementById("mySelect");
  var location = obj.options[obj.selectedIndex].text; //location에 텍스트 형태로 선택 된 타임존 저장되어있음
  var offset = obj.value; //value 부분 값, 즉 GMT 기준으로 +-시간이 저장되어있음

  alert("Confirmed : " + location);


  /* 사용자 등록 & 해당 사용자의 현재 도시 및 GMT 기준 시간 offset 저장 */
  firebase.database().ref('/users/' + getUserName()).set({
    location: location,
    offset: offset
  }).catch(function(error){
    console.error('Error writing user information to Realtime Database:', error);
  });
}


/* users 데이터베이스에서 사용자 목록 삭제 */
function deleteUser(){
  firebase.database().ref('/users/' + getUserName()).remove()
    .catch(function(error){
    console.error('Error deleting user information from Realtime Database:', error);
  });
}

/**데이터베이스의 모든 아이템을 배열 형태로 받아오는 함수 */
function snapshotToArray(snapshot) {
  var returnArr = [];

  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();
      item.key = childSnapshot.key;
      
      returnArr.push(item);
  });

  return returnArr;
};


/*상대방의 시간에 따른 배경 변경 기능*/
function changeBackground(){
  //클라이언트 기준을 한국으로 설정하고 진행하였음
  var time = new Date().getHours() - 9; //GMT 기준 시간
  var name = getUserName();
  console.log("현재 시각은 "+time);


  firebase.database().ref('/users').on('value', function(snapshot){
    console.log(snapshotToArray(snapshot));
    var userinfo= snapshotToArray(snapshot);
    var otherOffset;

    if(userinfo[0].key == name){
      otherOffset = userinfo[1].offset.toString(); //다른 사용자의 시간 오프셋을 받아온다
    }
    else{
      otherOffset = userinfo[0].offset.toString();
    }
    if(time+otherOffset>=22 || time+otherOffset<7){
      document.getElementById('messages-card-container').id='messages-card-container-night';
      console.log("밤으로 바뀜~");
    }
    else{
      document.getElementById('messages-card-container').id='messages-card-container-daytime';
      console.log("낮으로 바뀜~");
    }

  }, function(error){
    console.log("Error: "+error.code);
    document.getElementById('messages-card-container').id='messages-card-container';
  }

);
  
}