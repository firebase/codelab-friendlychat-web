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
const functions = require("firebase-functions");

// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp();

exports.beforeCreate = functions.auth.user().beforeCreate((user, context) => {
  // Only users of a specific domain can sign up.
  if (user?.email && !/^[^@]+@example\.com$/.test(user?.email)) {
    throw new functions.auth.HttpsError("invalid-argument", "Unauthorized email");
  }
});
