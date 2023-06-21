---
id: firebase-web
summary: In this codelab, you'll learn how to use the Firebase platform on the web by building a chat app.
status: [reviewed]
authors: Nicolas Garnier, Jeff Huleatt, Cynthia Wang
categories: Cloud,Web,Firebase
keywords: product: Cloud,Web,Firebase
tags: chromeos,firebase-dev-summit-2016,firebase17,gdd17,io2016,io2017,io2018,io2019,jsconfeu,kiosk,qwiklabs,sxsw,tag-firebase,tag-web,typtwd17,web

---

# AngularFire web codelab




## Overview
Duration: 01:00


In this codelab, you'll learn how to use [AngularFire](https://firebaseopensource.com/projects/firebase/angularfire/) to create web applications by implementing and deploying a chat client using Firebase products and services.

<img src="img/angularfire-2.png" alt="angularfire-2.png" title="Final App"  width="537.95" />

#### What you'll learn

* Build a web app using Angular and Firebase.
* Sync data using Cloud Firestore and Cloud Storage for Firebase.
* Authenticate your users using Firebase Authentication.
* Deploy your web app on Firebase Hosting.
* Send notifications with Firebase Cloud Messaging.
* Collect your web app's performance data.

#### What you'll need

* The IDE/text editor of your choice, such as  [WebStorm](https://www.jetbrains.com/webstorm),  [Atom](https://atom.io/),  [Sublime](https://www.sublimetext.com/), or  [VS Code](https://code.visualstudio.com/)
* The package manager  [npm](https://www.npmjs.com/), which typically comes with  [Node.js](https://nodejs.org/en/)
* A terminal/console
* A browser of your choice, such as Chrome
* The codelab's sample code (See the next step of the codelab for how to get the code.)


## Get the sample code
Duration: 02:00


Clone the codelab's [GitHub repository](https://github.com/firebase/codelab-friendlychat-web) from the command line:

```
git clone https://github.com/firebase/codelab-friendlychat-web
```

Alternatively, if you do not have git installed, you can  [download the repository as a ZIP file](https://github.com/firebase/codelab-friendlychat-web/archive/refs/heads/main.zip).

> aside positive
>
> The `friendlychat-web` repository contains sample projects for multiple platforms.
>
> This codelab only uses these two repositories:
>
> * 📁 **angularfire-start**: The starting code that you'll build upon during this codelab.
> * 📁 **angularfire**: The complete code for the finished sample app.
>
> **Note**: You can run the finished app locally using Emulator suite, however, if you would like to deploy and serve it, you'll still have to create a Firebase project in the Firebase console (see the section **Create and set up a Firebase project** in this codelab for instructions).

#### Import the starter app

Using your IDE, open or import the 📁 `angularfire-start` directory from the cloned repository. This 📁 `angularfire-start` directory contains the starting code for the codelab, which will be a fully functional chat web app.

> aside positive
>
> **Important**: After you have cloned or downloaded the code from the respository, access the 📁 `angularfire-start` directory in your console, and run `npm install` to install dependencies.

## Create and set up a Firebase project
Duration: 05:00


#### **Create a Firebase project**

1. Sign in to [Firebase](https://console.firebase.google.com/).
2. In the Firebase console, click **Add Project**, and then name your Firebase project **FriendlyChat**. Remember the project ID for your Firebase project.
3. Uncheck **Enable Google Analytics for this project**
4. Click **Create Project**.

> aside positive
>
> **Important**: Your Firebase project will be named **FriendlyChat**, but Firebase will automatically assign it a unique Project ID in the form **friendlychat-1234**. This unique identifier is how your project is actually identified (including in the CLI), whereas *FriendlyChat* is simply a display name.

The application that we're going to build uses Firebase products that are available for web apps:

* **Firebase Authentication** to easily allow your users to sign into your app.
* **Cloud Firestore** to save structured data on the cloud and get instant notification when data changes.
* **Cloud Storage for Firebase** to save files in the cloud.
* **Firebase Hosting** to host and serve your assets.
* **Firebase Cloud Messaging** to send push notifications and display browser popup notifications.
* **Firebase Performance Monitoring** to collect user performance data for your app.

Some of these products need special configuration or need to be enabled using the Firebase console.

#### Add a Firebase web app to the project

1. Click the web icon  <img src="img/58d6543a156e56f9.png" alt="58d6543a156e56f9.png"  width="41.00" />to create a new Firebase web app.
2. Register the app with the nickname **Friendly Chat**, then check the box next to **Also set up Firebase Hosting for this app**. Click **Register app**.
3. On the next step, you'll see a configuration object. Copy just the JS object (not the surrounding HTML) into [firebase-config.js](https://github.com/firebase/friendlychat/blob/master/web/src/firebase-config.js)

<img src="img/register-web-app.png" alt="Register web app screenshot"  width="624.00" />

#### Enable Google **sign-in for Firebase Authentication**

To allow users to sign in to the web app with their Google accounts, we'll use the **Google** sign-in method.

You'll need to enable **Google** sign-in:

1. In the Firebase console, locate the **Build** section in the left panel.
2. Click **Authentication**, then click the **Sign-in method** tab (or  [click here](https://console.firebase.google.com/project/_/authentication/providers) to go directly there).
3. Enable the **Google** sign-in provider, then click **Save**.
4. Set the public-facing name of your app to **Friendly Chat** and choose a **Project support email** from the dropdown menu.
5. Configure your OAuth consent screen in the  [Google Cloud Console](https://console.developers.google.com/apis/credentials/consent) and add a logo:

<img src="img/d89fb3873b5d36ae.png" alt="d89fb3873b5d36ae.png"  width="624.00" />

#### **Enable Cloud Firestore**

The web app uses  [Cloud Firestore](https://firebase.google.com/docs/firestore/) to save chat messages and receive new chat messages.

You'll need to enable Cloud Firestore:

1. In the Firebase console's **Build** section, click **Firestore Database**.
2. Click **Create database** in the Cloud Firestore pane.

<img src="img/729991a081e7cd5.png" alt="729991a081e7cd5.png"  width="533.00" />

> aside negative
>
> **Please be careful** to enable Cloud Firestore and **NOT** the Realtime Database for this codelab. Both options are on the same page, but you need to enable Cloud Firestore, which is in the top section of the page.

3. Select the **Start in test mode** option, then click **Next** after reading the disclaimer about the security rules.

Test mode ensures that we can freely write to the database during development. We'll make our database more secure later on in this codelab.

<img src="img/77e4986cbeaf9dee.png" alt="77e4986cbeaf9dee.png"  width="621.00" />

4. Set the location where your Cloud Firestore data is stored. You can leave this as the default or choose a region close to you. Click **Done** to provision Firestore.

<img src="img/9f2bb0d4e7ca49c7.png" alt="9f2bb0d4e7ca49c7.png"  width="624.00" />

#### **Enable Cloud Storage**

The web app uses Cloud Storage for Firebase to store, upload, and share pictures.

You'll need to enable Cloud Storage:

1. In the Firebase console's **Build** section, click **Storage**.
2. If there's no **Get Started** button, it means that Cloud storage is already
enabled, and you don't need to follow the steps below.
2. Click **Get Started**.
3. Read the disclaimer about security rules for your Firebase project, then click **Next**.

With the default security rules, any authenticated user can write anything to Cloud Storage. We'll make our storage more secure later in this codelab.

<img src="img/62f1afdcd1260127.png" alt="62f1afdcd1260127.png"  width="605.00" />

4. The Cloud Storage location is preselected with the same region you chose for your Cloud Firestore database. Click **Done** to complete the setup.

<img src="img/1d7f49ebaddb32fc.png" alt="1d7f49ebaddb32fc.png"  width="606.00" />


## Install the Firebase command-line interface
Duration: 02:00


The Firebase command-line interface (CLI) allows you to use Firebase Hosting to serve your web app locally, as well as to deploy your web app to your Firebase project.

> aside positive
>
> **Note**: To install the CLI, you need to install  [npm](https://www.npmjs.com/) which typically comes with  [Node.js](https://nodejs.org/en/).

1. Install the CLI by running the following npm command:

```
npm -g install firebase-tools
```

> aside negative
>
> Doesn't work? You may need to  [change npm permissions.](https://docs.npmjs.com/getting-started/fixing-npm-permissions)

2. Verify that the CLI has been installed correctly by running the following command:

```
firebase --version
```

Make sure that the version of the Firebase CLI is v4.1.0 or later.

3. Authorize the Firebase CLI by running the following command:

```
firebase login
```

We've set up the web app template to pull your app's configuration for Firebase Hosting from your app's local directory (the repository that you cloned earlier in the codelab). But to pull the configuration, we need to associate your app with your Firebase project.

4. Make sure that your command line is accessing your app's local `angularfire-start` directory.

5. Associate your app with your Firebase project by running the following command:

```
firebase use --add
```

6. When prompted, select your **Project ID**, then give your Firebase project an alias.

An alias is useful if you have multiple environments (production, staging, etc). However, for this codelab, let's just use the alias of `default`.

7. Follow the remaining instructions on your command line.

## Install AngularFire
Duration: 05:00

Before running the project, make sure you have the Angular CLI and AngularFire set up.

1. In a console, run the following command:
```console
npm install -g @angular/cli
```
2. Then, in a console from the `angularfire-start` directory, run the following Angular CLI command:

```console
ng add @angular/fire
```

This will install all the necessary dependencies for your project.

3. When prompted, select the features that were set up in the Firebase Console (`ng deploy -- hosting`, `Authentication`, `Firestore`, `Cloud Functions (callable)`, `Cloud Messaging`, `Cloud Storage`), and follow the prompts on the console.

## Run the starter app locally
Duration: 01:00


Now that you have imported and configured your project, you are ready to run the web app for the first time.

1. In a console from the `angularfire-start` directory, run the following Firebase CLI command:

```
firebase emulators:start
```

2. Your command line should display the following response:

```
✔  hosting: Local server: http://localhost:5000
```

We're using the  [Firebase Hosting](https://firebase.google.com/docs/hosting/) emulator to serve our app locally. The web app should now be available from  [http://localhost:5000](http://localhost:5000). All the files that are located under the `src` subdirectory are served.

3. Using your browser, open your app at  [http://localhost:5000](http://localhost:5000).

You should see your FriendlyChat app's UI, which is not (yet!) functioning:

<img src="img/4c23f9475228cef4.png" alt="4c23f9475228cef4.png"  width="438.40" />

The app cannot do anything right now, but with your help it will soon! We've only laid out the UI for you so far.

Let's now build a realtime chat!


## Import and configure Firebase
Duration: 05:00

#### **Configure Firebase**

You'll need to configure the Firebase SDK to tell it which Firebase project that we're using. 

1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
2. In the "Your apps" card, select the nickname of the app for which you need a config object.
3. Select "Config" from the Firebase SDK snippet pane.

You will find that a environment file `/angularfire-start/src/environments/environment.ts` was generated for you.

4. Copy the config object snippet, then add it to `angularfire-start/src/firebase-config.js`.

####  [environment.ts](https://github.com/firebase/friendlychat/blob/master/angularfire-start/src/environments/environment.ts)

```
export const environment = {
  firebase: {
    apiKey: "API_KEY",
    authDomain: "PROJECT_ID.firebaseapp.com",
    databaseURL: "https://PROJECT_ID.firebaseio.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID",
    measurementId: "G-MEASUREMENT_ID",
  },
};
```

> aside positive
>
> The above code should contain your app-specific Firebase config object, not our placeholder values!


#### **Import AngularFire**

You will find that featues you've selected in the console were automatically routed in the `/angularfire-start/src/app/app.module.ts` file. This allows your app to use Firebase features and functionalities. However, to develop in a local environment, you need to connect them to use the Emulator suite.

1. In `/angularfire-start/src/app/app.module.ts`, find the `imports` section, and modify the provide functions to connect to Emulator suite in non-production environments.

```
...

import { provideAuth,getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore,getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideFunctions,getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { provideStorage,getStorage, connectStorageEmulator } from '@angular/fire/storage';

...

provideFirebaseApp(() => initializeApp(environment.firebase)),
provideAuth(() => {
    const auth = getAuth();
    if (location.hostname === 'localhost') {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    return auth;
}),
provideFirestore(() => {
    const firestore = getFirestore();
    if (location.hostname === 'localhost') {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    }
    return firestore;
}),
provideFunctions(() => {
    const functions = getFunctions();
    if (location.hostname === 'localhost') {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
    return functions;
}),
provideStorage(() => {
    const storage = getStorage();
    if (location.hostname === 'localhost') {
        connectStorageEmulator(storage, '127.0.0.1', 5001);
    }
    return storage;
}),
provideMessaging(() => {
    return getMessaging();
}),
```
####  [app.module.ts](https://github.com/firebase/friendlychat/blob/master/angularfire-start/src/app/app.module.ts)


During this codelab, we're going to use Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Messaging, and Performance Monitoring, so we're importing all of their libraries. In your future apps, make sure that you're only importing the parts of Firebase that you need, to shorten the load time of your app.


## Set up user sign-in
Duration: 10:00


AngularFire should now be ready to use since it's imported and initialized in `app.module.ts`. We're now going to implement user sign-in using  [Firebase Authentication](https://firebase.google.com/docs/auth/web/start).

#### **Authenticate your users with Google Sign-In**

In the app, when a user clicks the **Sign in with Google** button, the `login` function is triggered. (We already set that up for you!) For this codelab, we want to authorize Firebase to use Google as the identity provider. We'll use a popup, but  [several other methods](https://firebase.google.com/docs/auth/web/google-signin) are available from Firebase.

1. In the `angularfire-start` directory, in the subdirectory `/src/app/services/`, open `chat.service.ts`.
2. Find the function `login`.
3. Replace the entire function with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Signs-in Friendly Chat.
login() {
    signInWithPopup(this.auth, this.provider).then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        this.router.navigate(['/', 'chat']);
        return credential;
    })
}
```

The `logout` function is triggered when the user clicks the **Log out** button.

1. Go back to the file `src/app/services/chat.service.ts`.
2. Find the function `logout`.
3. Replace the entire function with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Logout of Friendly Chat.
logout() {
    signOut(this.auth).then(() => {
        this.router.navigate(['/', 'login'])
        console.log('signed out');
    }).catch((error) => {
        console.log('sign out error: ' + error);
    })
}
```

#### **Track the authentication state**

To update our UI accordingly, we need a way to check if the user is logged in or logged out. With Firebase Authentication, you can register retrieve observable on the user state that will be triggered each time the authentication state changes.

1. Go back to the file `src/app/services/chat.service.ts`.
2. Find the variable assignment `user$`.
3. Replace the entire assignment with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Observable user
user$ = user(this.auth);
```

The code above calls the AngularFire function `user` which returns an observable user. It will trigger each time the authentication state changes (when the user signs in or signs out). It's at this point that we'll update the UI to redirect, display the user in the header nav, and so on. All of these UI parts have already been implemented.


#### Test logging into the app

1. If your app is still being served, refresh your app in the browser. Otherwise, run `firebase emulators:start` on the command line to start serving the app from  [http://localhost:5000](http://localhost:5000), and then open it in your browser.
2. Log in to the app using the sign-in button and your Google account. If you see an error message stating `auth/operation-not-allowed`, check to make sure that you enabled Google Sign-in as an authentication provider in the Firebase console.
3. After logging in, your profile picture and user name should be displayed:
<img src="img/angularfire-3.png" alt="angularfire-3.png"  width="312.00" />


## Write messages to Cloud Firestore
Duration: 05:00


In this section, we'll write some data to Cloud Firestore so that we can populate the app's UI. This can be done manually with the  [Firebase console](https://console.firebase.google.com), but we'll do it in the app itself to demonstrate a basic Cloud Firestore write.

#### **Data model**

Cloud Firestore data is split into collections, documents, fields, and subcollections. We will store each message of the chat as a document in a top-level collection called `messages`.

<img src="img/688d7bc5fb662b57.png" alt="688d7bc5fb662b57.png"  width="193.10" />

> aside positive
> 
> **Tip**: To learn more about the Cloud Firestore data model, read about documents and collections in  [the documentation](https://firebase.google.com/docs/firestore/data-model).

#### **Add messages to Cloud Firestore**

To store the chat messages that are written by users, we'll use  [Cloud Firestore](https://firebase.google.com/docs/firestore/).

In this section, you'll add the functionality for users to write new messages to your database. A user clicking the **SEND** button will trigger the code snippet below. It adds a message object with the contents of the message fields to your Cloud Firestore instance in the `messages` collection. The `add()` method adds a new document with an automatically generated ID to the collection.

1. Go back to the file `src/app/services/chat.service.ts`.
2. Find the function `addMessage`.
3. Replace the entire function with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Adds a text or image message to Cloud Firestore.
addMessage = async(textMessage: string | null, imageUrl: string | null): Promise<void | DocumentReference<DocumentData>> => {
    let data: any;
    try {
      this.user$.subscribe(async (user) => 
      { 
        if(textMessage && textMessage.length > 0) {
          data =  await addDoc(collection(this.firestore, 'messages'), {
            name: user?.displayName,
            text: textMessage,
            profilePicUrl: user?.photoURL,
            timestamp: serverTimestamp(),
            uid: user?.uid
          })}
          else if (imageUrl && imageUrl.length > 0) {
            data =  await addDoc(collection(this.firestore, 'messages'), {
              name: user?.displayName,
              imageUrl: imageUrl,
              profilePicUrl: user?.photoURL,
              timestamp: serverTimestamp(),
              uid: user?.uid
            });
          }
          return data;
        }
      );
    }
    catch(error) {
      console.error('Error writing new message to Firebase Database', error);
      return;
    }
}
```

#### **Test sending messages**

1. If your app is still being served, refresh your app in the browser. Otherwise, run `firebase emulators:start` on the command line to start serving the app from  [http://localhost:5000](http://localhost:5000), and then open it in your browser.
2. After logging in, enter a message such as "Hey there!", and then click **SEND**. This will write the message into Cloud Firestore. However, *you won't yet see the data in your actual web app* because we still need to implement *retrieving* the data (the next section of the codelab).
3. You can see the newly added message in your Firebase Console. Open your Emulator suite UI. Under the **Build** section click **Firestore Database** (or click  [here](http://localhost:4000/firestore/data) and you should see the **messages** collection with your newly added message:

<img src="img/6812efe7da395692.png" alt="6812efe7da395692.png"  width="624.00" />


## Read messages
Duration: 10:00


#### Synchronize **messages**

To read messages in the app, you'll need to add an observable that will trigger when data changes and then create a UI element that shows new messages.

We'll add code that listens for newly added messages from the app. In this code, you'll retrieve the snapshot of the `messages` collection. You'll only display the last 12 messages of the chat to avoid displaying a very long history upon loading.

1. Go back to the file `src/app/services/chat.service.ts`.
2. Find the function `loadMessages`.
3. Replace the entire function with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Loads chat messages history and listens for upcoming ones.
loadMessages = () => {
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(this.firestore, 'messages'), orderBy('timestamp', 'desc'), limit(12));
  // Start listening to the query.
  return collectionData(recentMessagesQuery);
}
```

To listen to messages in the database, we create a query on a collection by using the `collection` function to specify which collection the data that we want to listen to is in. In the code above, we're listening to the changes within the `messages` collection, which is where the chat messages are stored. We're also applying a limit by only listening to the last 12 messages using `limit(12)` and ordering the messages by date using `orderBy('timestamp', 'desc')` to get the 12 newest messages.

The `collectionData` function uses snapshots under the hood. The callback function will be triggered when there are any changes to documents that match the query. This could be if a message gets deleted, modified, or added. You can read more about this in the  [Cloud Firestore documentation](https://firebase.google.com/docs/firestore/query-data/listen).

#### Test synchronizing messages

1. If your app is still being served, refresh your app in the browser. Otherwise, run `firebase emulators:start` on the command line to start serving the app from  [http://localhost:5000](http://localhost:5000), and then open it in your browser.
2. The messages that you created earlier into the database should be displayed in the FriendlyChat UI (see below). Feel free to write new messages; they should appear instantly.
3. *(Optional)* You can try manually deleting, modifying, or adding new messages directly in the **Firestore** section of the Emulator suite; any changes should be reflected in the UI.

Congratulations! You are reading Cloud Firestore documents in your app!

<img src="img/angularfire-2.png" alt="angularfire-2.png"  width="464.18" />


## Send images
Duration: 10:00


We'll now add a feature that shares images.

While Cloud Firestore is good for storing structured data, Cloud Storage is better suited for storing files.  [Cloud Storage for Firebase](https://firebase.google.com/docs/storage/) is a file/blob storage service, and we'll use it to store any images that a user shares using our app.

#### Save images to Cloud Storage

For this codelab, we've already added for you a button that triggers a file picker dialog. After selecting a file, the `saveImageMessage` function is called, and you can get a reference to the selected file. The `saveImageMessage` function accomplishes the following:

1. Creates a "placeholder" chat message in the chat feed, so that users see a "Loading" animation while we upload the image.
2. Uploads the image file to Cloud Storage to this path: `/&lt;uid&gt;/&lt;file_name&gt;`
3. Generates a publicly readable URL for the image file.
4. Updates the chat message with the newly uploaded image file's URL in lieu of the temporary loading image.

Now you'll add the functionality to send an image:

1. Go back to the file `src/index.js`.
2. Find the function `saveImageMessage`.
3. Replace the entire function with the following code.

####  [index.js](https://github.com/firebase/friendlychat/blob/master/web/src/index.js#L84-109)

```
// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
saveImageMessage = async(file: any) => {
  try {
    // 1 - We add a message with a loading icon that will get updated with the shared image.
    const messageRef = await this.addMessage(null, this.LOADING_IMAGE_URL);

    // 2 - Upload the image to Cloud Storage.
    const filePath = `${this.auth.currentUser?.uid}/${file.name}`;
    const newImageRef = ref(this.storage, filePath);
    const fileSnapshot = await uploadBytesResumable(newImageRef, file);
    
    // 3 - Generate a public URL for the file.
    const publicImageUrl = await getDownloadURL(newImageRef);

    // 4 - Update the chat message placeholder with the image’s URL.
    messageRef ?
    await updateDoc(messageRef,{
      imageUrl: publicImageUrl,
      storageUri: fileSnapshot.metadata.fullPath
    }): null;
  } catch (error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  }
}
```

#### **Test sending images**

1. If your app is still being served, refresh your app in the browser. Otherwise, run `firebase emulators:start` on the command line to start serving the app from  [http://localhost:5000](http://localhost:5000), and then open it in your browser.
2. After logging in, click the image upload button on the bottom left <img src="img/angularfire-4.png" alt="angularfire-4.png"  width="26.61" /> and select an image file using the file picker. If you're looking for an image, feel free to use this  [nice picture of a coffee cup](https://www.pexels.com/photo/aroma-aromatic-art-artistic-434213/).
3. A new message should appear in the app's UI with your selected image:
<img src="img/3b1284f5144b54f6.png" alt="3b1284f5144b54f6.png"  width="555.06" />

If you try adding an image while not signed in, you should see an error telling you that you must sign in to add images.


## Show notifications
Duration: 10:00


We'll now add support for browser notifications. The app will notify users when new messages are posted in the chat.  [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/) (FCM) is a cross-platform messaging solution that lets you reliably deliver messages and notifications at no cost.

#### **Add the FCM service worker**

The web app needs a [service worker](https://developer.mozilla.org/en/docs/Web/API/Service_Worker_API) that will receive and display web notifications.

The messaging provider should already be set up when AngularFire was added, make sure that the following code exists in the imports section of `/angularfire-start/src/app/app.module.ts`


```
provideMessaging(() => {
    return getMessaging();
}),
```
####  [app/app.module.ts](https://github.com/firebase/friendlychat/blob/master/web/angularfire-start/src/app/app.module.ts)

The service worker simply needs to load and initialize the Firebase Cloud Messaging SDK, which will take care of displaying notifications.

#### **Get FCM device tokens**

When notifications have been enabled on a device or browser, you'll be given a **device token**. This device token is what we use to send a notification to a particular device or particular browser.

When the user signs-in, we call the `saveMessagingDeviceToken` function. That's where we'll get the **FCM device token** from the browser and save it to Cloud Firestore.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)
2. Find the function `saveMessagingDeviceToken`.
3. Replace the entire function with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Saves the messaging device token to Cloud Firestore.
saveMessagingDeviceToken= async () => {
    try {
      const currentToken = await getToken(this.messaging);
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to Cloud Firestore.
        const tokenRef = doc(this.firestore, 'fcmTokens', currentToken);
        await setDoc(tokenRef, { uid: this.auth.currentUser?.uid });
 
        // This will fire when a message is received while the app is in the foreground.
        // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
        onMessage(this.messaging, (message) => {
          console.log(
            'New foreground notification from Firebase Messaging!',
            message.notification
          );
        });
      } else {
        // Need to request permissions to show notifications.
        this.requestNotificationsPermissions();
      }
    } catch(error) {
      console.error('Unable to get messaging token.', error);
    };
}
```

However, this code won't work initially. For your app to be able to retrieve the device token, the user needs to grant your app permission to show notifications (next step of the codelab).

#### **Request permissions to show notifications**

When the user has not yet granted your app permission to show notifications, you won't be given a device token. In this case, we call the `requestPermission()` method, which will display a browser dialog asking for this permission ( [in supported browsers](https://caniuse.com/#feat=push-api)).

<img src="img/8b9d0c66dc36153d.png" alt="8b9d0c66dc36153d.png"  width="567.50" />

1. Go back to the file `src/app/services/chat.service.ts`.
2. Find the function `requestNotificationsPermissions`.
3. Replace the entire function with the following code.

####  [chat.service.ts](https://github.com/firebase/friendlychat/blob/master/angularfire/src/app/services/chat.service.ts)

```
// Requests permissions to show notifications.
requestNotificationsPermissions = async () => {
    console.log('Requesting notifications permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Notification permission granted.
      await this.saveMessagingDeviceToken();
    } else {
      console.log('Unable to get permission to notify.');
    }
}
```

#### **Get your device token**

1. If your app is still being served, refresh your app in the browser. Otherwise, run `firebase emulators:start` on the command line to start serving the app from  [http://localhost:5000](http://localhost:5000), and then open it in your browser.
2. After logging in, the notifications permission dialog should appear:
<img src="img/bd3454e6dbfb6723.png" alt="bd3454e6dbfb6723.png"  width="480.00" />
3. Click **Allow**.
4. Open the JavaScript console of your browser. You should see the following message:
`Got FCM device token: cWL6w:APA91bHP...4jDPL_A-wPP06GJp1OuekTaTZI5K2Tu`
5. Copy your device token. You'll need it for the next stage of the codelab.

#### **Send a notification to your device**

Now that you have your device token, you can send a notification.

1. Open the [Cloud Messaging tab of the Firebase console](https://console.firebase.google.com/project/_/notification).
2. Click "New Notification"
3. Enter a notification title and notification text.
4. On the right side of the screen, click "send a test message"
5. Enter the device token you copied from the JavaScript console of your browser, then click the plus ("+") sign
6. Click "test"

If your app is in the foreground, you'll see the notification in the JavaScript console.

If your app is in the background, a notification should appear in your browser, as in this example:

<img src="img/de79e8638a45864c.png" alt="de79e8638a45864c.png"  width="377.78" />

> aside positive
> 
> In a followup codelab,  [**Firebase SDK for Cloud Functions**](https://codelabs.developers.google.com/codelabs/firebase-cloud-functions), we'll see how to automate sending notifications from the backend for each new message posted in the chat app.

## Cloud Firestore security rules
Duration: 05:00


#### View **database security rules**

Cloud Firestore uses a specific  [rules language](https://firebase.google.com/docs/firestore/security/overview) to define access rights, security, and data validations.

When setting up the Firebase project at the beginning of this codelab, we chose to use "Test mode" default security rules so that we didn't restrict access to the datastore. In the  [Firebase console](https://console.firebase.google.com), in the **Database** section's **Rules** tab, you can view and modify these rules.

Right now, you should see the default rules, which do not restrict access to the datastore. This means that any user can read and write to any collections in your datastore.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```

We'll update the rules to restrict things by using the following rules:

####  [firestore.rules](https://github.com/firebase/friendlychat/blob/master/angularfire-start/firestore.rules)

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Messages:
    //   - Anyone can read.
    //   - Authenticated users can add and edit messages.
    //   - Validation: Check name is same as auth token and text length below 300 char or that imageUrl is a URL.
    //   - Deletes are not allowed.
    match /messages/{messageId} {
      allow read;
      allow create, update: if request.auth != null
                    && request.resource.data.name == request.auth.token.name
                    && (request.resource.data.text is string
                      && request.resource.data.text.size() <= 300
                      || request.resource.data.imageUrl is string
                      && request.resource.data.imageUrl.matches('https?://.*'));
      allow delete: if false;
    }
    // FCM Tokens:
    //   - Anyone can write their token.
    //   - Reading list of tokens is not allowed.
    match /fcmTokens/{token} {
      allow read: if false;
      allow write;
    }
  }
}
```

> aside positive
> 
> The `request.auth` rule variable is a special variable containing information about an authenticated user. The `request.resource` rule variable points to the new data being written. More information can be found in  [the documentation](https://firebase.google.com/docs/firestore/security/overview).

The security rules should update automatically to your Emulator suite. 

#### **View Cloud Storage security rules**

Cloud Storage for Firebase uses a specific  [rules language](https://firebase.google.com/docs/storage/security/start) to define access rights, security, and data validations.

When setting up the Firebase project at the beginning of this codelab, we chose to use the default Cloud Storage security rule that only allows authenticated users to use Cloud Storage. In the  [Firebase console](https://console.firebase.google.com), in the **Storage** section's **Rules** tab, you can view and modify rules. You should see the default rule which allows any signed-in user to read and write any files in your storage bucket.

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

We'll update the rules to do the following:

* Allow each user to write only to their own specific folders
* Allow anyone to read from Cloud Storage
* Make sure that the files uploaded are images
* Restrict the size of the images that can be uploaded to maximum 5 MB

This can be implemented using the following rules:

####  [storage.rules](https://github.com/firebase/friendlychat/blob/master/angularfire-start/storage.rules)

```
rules_version = '2';

// Returns true if the uploaded file is an image and its size is below the given number of MB.
function isImageBelowMaxSize(maxSizeMB) {
  return request.resource.size < maxSizeMB * 1024 * 1024
      && request.resource.contentType.matches('image/.*');
}

service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{messageId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == userId && isImageBelowMaxSize(5);
      allow read;
    }
  }
}
```

> aside positive
>
> The `request.auth` rule variable is a special variable containing information about an authenticated user. The `request.resource` rule variable contains information about the uploaded file. More information can be found in  [the documentation](https://firebase.google.com/docs/storage/security/start).


## Deploy your app using Firebase Hosting
Duration: 03:00


Firebase offers a [hosting service](https://firebase.google.com/docs/hosting/) to serve your assets and web apps. You can deploy your files to Firebase Hosting using the Firebase CLI. Before deploying, you need to specify in your `firebase.json` file which local files should be deployed. For this codelab, we've already done this for you because this step was required to serve our files during this codelab. The hosting settings are specified under the `hosting` attribute:

####  [firebase.json](https://github.com/firebase/friendlychat/blob/master/web/firebase.json#L8-L17)

```
{
  // If you went through the "Cloud Firestore Security Rules" step.
  "firestore": {
    "rules": "firestore.rules"
  },
  // If you went through the "Storage Security Rules" step.
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "./public"
  }
}
```

These settings tell the CLI that we want to deploy all files in the `./public` directory ( `"public": "./public"` ).

1. Make sure that your command line is accessing your app's local `angularfire-start` directory.
2. Deploy your files to your Firebase project by running the following command:

```
ng deploy
```

Then select the Firebase option, and follow the prompts in the command line.

3. The console should display the following:

```
=== Deploying to 'friendlychat-1234'...

i  deploying firestore, storage, hosting
i  storage: checking storage.rules for compilation errors...
✔  storage: rules file storage.rules compiled successfully
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  storage: uploading rules storage.rules...
i  firestore: uploading rules firestore.rules...
i  hosting[friendlychat-1234]: beginning deploy...
i  hosting[friendlychat-1234]: found 8 files in ./public
✔  hosting[friendlychat-1234]: file upload complete
✔  storage: released rules storage.rules to firebase.storage/friendlychat-1234.appspot.com
✔  firestore: released rules firestore.rules to cloud.firestore
i  hosting[friendlychat-1234]: finalizing version...
✔  hosting[friendlychat-1234]: version finalized
i  hosting[friendlychat-1234]: releasing new version...
✔  hosting[friendlychat-1234]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/friendlychat-1234/overview
Hosting URL: https://friendlychat-1234.firebaseapp.com
```

4. Visit your web app that's now fully hosted on a global CDN using Firebase Hosting at two of your very own Firebase subdomains: 

* `https://&lt;firebase-projectId&gt;.firebaseapp.com`
* `https://&lt;firebase-projectId&gt;.web.app`

Alternatively, you can run `firebase open hosting:site` in the command line.

Visit the documentation to learn more about  [how Firebase Hosting works](https://firebase.google.com/docs/hosting/#how_does_it_work).

Go to your project's Firebase console **Hosting** section to view useful hosting information and tools, including the history of your deploys, the functionality to roll back to previous versions of your app, and the workflow to set up a custom domain.


## Congratulations!



You've used Firebase to build a real-time chat web application!

#### **What we've covered**

* Firebase Authentication
* Cloud Firestore
* Firebase SDK for Cloud Storage
* Firebase Cloud Messaging
* Firebase Performance Monitoring
* Firebase Hosting

#### Next steps

> aside positive
> 
> Continue on to the  [**Cloud Functions for Firebase**](https://codelabs.developers.google.com/codelabs/firebase-cloud-functions/#4) codelab to learn how to use the Firebase SDK for Cloud Functions and add some backend tasks to your chat app. You can start directly on Step 5 of that codelab since you've already set up your Firebase project.

> aside positive
> 
> Want to learn more about Cloud Firestore? Maybe you want to learn about subcollections and transactions? Head over to the  [**Cloud Firestore web codelab**](https://codelabs.developers.google.com/codelabs/firestore-web/#0) for a codelab that goes into greater depth on Cloud Firestore.

> aside positive
> 
> Want to learn more about Firebase Performance Monitoring for Web? Head over to the  [**Firebase performance monitoring for web codelab**](https://codelabs.developers.google.com/codelabs/firebase-perf-mon-web/) for a codelab that goes into greater depth on Firebase Performance Monitoring.

#### **Learn more**

*  [firebase.google.com](https://firebase.google.com)


