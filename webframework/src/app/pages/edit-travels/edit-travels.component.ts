import { Component, OnInit, inject } from '@angular/core';
import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot, Timestamp, docData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, switchMap } from 'rxjs';
import { Stop, Travel } from 'src/app/models/travel.model';
import { TravelService } from 'src/app/services/travel.service';

@Component({
  selector: 'app-edit-travels',
  templateUrl: './edit-travels.component.html',
  styleUrls: ['./edit-travels.component.scss']
})
export class EditTravelsComponent {
  
  private activatedRoute = inject(ActivatedRoute);
  travelService: TravelService = inject(TravelService);
  travelId = this.activatedRoute.snapshot.paramMap.get('travelId');
  travelData$: Observable<Travel>;
  stopsData$: Observable<Stop[]>;
  constructor() {
    this.travelData$ = this.travelService.getDocData(`travels/${this.travelId}`) as Observable<Travel>;
    this.stopsData$ = this.travelService.getCollectionData(`travels/${this.travelId}/stops`) as Observable<Stop[]>;
   }

  
  updateCurrentTravel(travel: Partial<Travel>) {
    this.travelService.updateData(`travels/${this.travelId}`, travel);
  }

  updateCurrentStop(stop: Partial<Stop>) {
    stop.type = stop.type?.toString();
    console.log("mainedittravels: ", `travels/${this.travelId}/stops/${stop.id}`, stop);
    this.travelService.updateData(`travels/${this.travelId}/stops/${stop.id}`, stop);
  }

  addStop() {
    if (this.travelId) {
      this.travelService.addStop(this.travelId);
    }
  }
  deleteStop(stopId: string) {
    console.log(this.travelId,stopId, stop,"SDWED s");
    if (this.travelId && stopId) {
      this.travelService.deleteDoc(`travels/${this.travelId}/stops/${stopId}`);
      this.stopsData$ = this.travelService.getCollectionData(`travels/${this.travelId}/stops`) as Observable<Stop[]>;
    }
  }

  uploadFileToStop(file: HTMLInputElement, stop: Partial<Stop>) {
    const url = `gs://friendly-travels.appspot.com/travels/${this.travelId}/stops/${stop.id}`;
    this.travelService.uploadToStorage(url, file)
    stop.image = url;
    this.travelService.updateData(`travels/${this.travelId}/stops/${stop.id}`, stop)
  }
  
}
