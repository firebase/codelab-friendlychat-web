import type { User } from "firebase/auth";
import { DocumentReference, Timestamp } from "firebase/firestore";


export type StopType = 'ATTRACTION' | 'STOP' | 'FOOD' | 'LODGING';
export type BaseStop = {
    id: string;
    visitDate: Timestamp;
    mood: number;
    blogText: string;
    image: string;
    location: Geolocation;
    type: StopType | string;
    title: string;
}

export type BaseTravel = {
    id: string;
    startDate: Timestamp;
    endDate: Timestamp;
    isPublic: boolean;
    userId: String;
    title: string;
}

export interface Travel extends BaseTravel {
}

export interface Stop extends BaseStop {
}

export type TravelRef = DocumentReference<Travel>;

export type TravelRefModel = {
  ref: TravelRef;
  user: User;
}

export class TravelObject implements Travel {
    id!: string;
    startDate!: Timestamp;
    endDate!: Timestamp;
    isPublic: boolean = false;
    userId!: String
    title: string = '';
}

export class StopObject implements Stop {
    id!: string;
    visitDate!: Timestamp;
    mood: number = 1;
    blogText: string = '';
    image!: string;
    location!: Geolocation;
    type: StopType | string = 'STOP';
    title: string = '';
}
