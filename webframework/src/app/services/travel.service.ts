import { inject, Injectable } from "@angular/core";
import { Auth, authState, onAuthStateChanged } from '@angular/fire/auth';
import { map, switchMap, firstValueFrom, filter, Observable } from "rxjs";
import {  doc, docData, DocumentReference, Firestore, getDoc, setDoc, updateDoc, collection, addDoc, deleteDoc, collectionData, Timestamp } from "@angular/fire/firestore";
import { Stop, Travel, TravelRefModel, TravelRef, TravelObject, BaseTravel, StopObject } from "../models/travel.model";
import { Storage, ref, uploadBytesResumable } from "@angular/fire/storage";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class TravelService {

}