import { inject, Injectable } from "@angular/core";
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, user, getAuth } from '@angular/fire/auth';
import { map, switchMap, firstValueFrom, filter, Observable } from "rxjs";
import {  doc, docData, DocumentReference, Firestore, getDoc, setDoc, updateDoc, collection, addDoc, deleteDoc, collectionData, Timestamp, serverTimestamp, query, orderBy, limit, onSnapshot, DocumentData, } from "@angular/fire/firestore";
import { Storage, getDownloadURL, ref, uploadBytesResumable } from "@angular/fire/storage";
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // Observable user
  user$ = user(this.auth);

  // Login Friendly Chat.
  login() {
    signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      this.router.navigate(['/', 'chat']);
      return credential;
    })
  }

  // Logout of Friendly Chat.
  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/', 'login'])
      console.log('signed out');
    }).catch((error) => {
      console.log('sign out error: ' + error);
    })
  }

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

// Saves a new message to Cloud Firestore.
 saveTextMessage = async (messageText: string) => {
  // Add a new message entry to the Firebase database.
  return this.addMessage(messageText, null);
}

 // Loads chat messages history and listens for upcoming ones.
loadMessages = () => {
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(this.firestore, 'messages'), orderBy('timestamp', 'desc'), limit(12));
  // Start listening to the query.
  return collectionData(recentMessagesQuery);
}

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

  async updateData(path: string, data: any) {
    await updateDoc(doc(this.firestore, path), data)
  }

  async deleteData(path: string) {
    const ref = doc(this.firestore, path);
    await deleteDoc(ref)
  }

  getDocData(path: string) {
    return docData(doc(this.firestore, path), {idField: 'id'}) as Observable<any>
  }

  getCollectionData(path: string) {
    return collectionData(collection(this.firestore, path), {idField: 'id'}) as Observable<any[]>
  }

  async uploadToStorage(path: string, input: HTMLInputElement, contentType: any) {
    if (!input.files) return null
        const files: FileList = input.files;
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
              const imagePath = `${path}/${file.name}`
              const storageRef = ref(this.storage, imagePath);
              await uploadBytesResumable(storageRef, file, contentType);
              return await getDownloadURL(storageRef);
            }
        }
        return null
  }
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
}
