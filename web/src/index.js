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

import {initializeApp} from 'firebase/app';
import {getPerformance} from 'firebase/performance';

import {getFirebaseConfig} from './firebase-config.js';
import {
    initFirebaseAuth,
    signIn,
    signInButtonElement,
    signOutButtonElement,
    signOutUser
} from "./firebase-components/auth";
import {
    imageButtonElement,
    loadMessages,
    messageFormElement,
    messageInputElement,
    onMediaFileSelected,
    onMessageFormSubmit,
    toggleButton
} from "./firebase-components/messages";

var mediaCaptureElement = document.getElementById('mediaCapture');
 
 // Saves message on form submit.
 messageFormElement.addEventListener('submit', onMessageFormSubmit);
 signOutButtonElement.addEventListener('click', signOutUser);
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

const firebaseApp = initializeApp(getFirebaseConfig());
getPerformance();
initFirebaseAuth();
loadMessages();
 