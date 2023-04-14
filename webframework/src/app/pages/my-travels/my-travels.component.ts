import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TravelService } from '../../services/travel.service';
import { Stop, Travel } from 'src/app/models/travel.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-travels',
  templateUrl: './my-travels.component.html',
  styleUrls: ['./my-travels.component.scss']
})
export class MyTravelsComponent {
	travelService: TravelService = inject(TravelService);
	user$ = this.travelService.user$;
	travelsData$: Observable<Travel[]>;
	stopsList$!: Observable<Stop[]>;
	router: Router = inject(Router);
	selectedTravel!: String;
	constructor() {
		this.travelsData$ = this.travelService.getCollectionData(`travels`) as Observable<Travel[]>;
	}

	async createTravel(userId: String) {
		await this.travelService.addEmptyTravel(userId);
	  }

	  onSelectTravelUpdate(travelId: String) {
		this.selectedTravel = travelId;
		this.stopsList$ = this.travelService.getCollectionData(`travels/${this.selectedTravel}/stops`) as Observable<Stop[]>;
	  }
	  editTravel(travelId: String) {
		this.router.navigate(['edit', `${travelId}`]);
	  }
}
