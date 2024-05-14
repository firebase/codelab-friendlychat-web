import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  getAuth,
  User,
} from '@angular/fire/auth';
import { map, switchMap, firstValueFrom, filter, Observable, Subscription } from 'rxjs';
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  collectionData,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  FieldValue,
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Router } from '@angular/router';

type ChatMessage = {
  name: string | null,
  profilePicUrl: string | null,
  timestamp: FieldValue,
  uid: string | null,
  text?: string,
  imageUrl?: string
};


@Injectable({
  providedIn: 'root',
})
export class ChatService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // observable that is updated when the auth state changes
  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  userSubscription: Subscription;
  
  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
        this.currentUser = aUser;
    });
  }

  // Login Friendly Chat.
  login() {}

  // Logout of Friendly Chat.
  logout() {}

  // Adds a text or image message to Cloud Firestore.
  addMessage = async (
    textMessage: string | null,
    imageUrl: string | null
  ): Promise<void | DocumentReference<DocumentData>> => {};

  // Saves a new message to Cloud Firestore.
  saveTextMessage = async (messageText: string) => {
    return this.addMessage(messageText, null);
  };

  // Loads chat messages history and listens for upcoming ones.
  loadMessages = () => {
    return null as unknown;
  };

  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  saveImageMessage = async (file: any) => {};

  async updateData(path: string, data: any) {}

  async deleteData(path: string) {}

  getDocData(path: string) {}

  getCollectionData(path: string) {}

  async uploadToStorage(
    path: string,
    input: HTMLInputElement,
    contentType: any
  ) {
    return null;
  }
  // Requests permissions to show notifications.
  requestNotificationsPermissions = async () => {};

  saveMessagingDeviceToken = async () => {};
}
