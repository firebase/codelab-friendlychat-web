import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Travel, TravelObject } from 'src/app/models/travel.model';

@Component({
  selector: 'app-edit-travel',
  templateUrl: './edit-travel.component.html',
  styleUrls: ['./edit-travel.component.scss']
})
export class EditTravelComponent {
  @Output('on-change') onChange = new EventEmitter<Partial<Travel>>();
  @Input() travel: Travel = new TravelObject();
  travelData!: Travel;

  ngOnInit() {
    this.travelData = { 
      ...this.travel
    };
  }
  onUpdate(travel: Partial<Travel>) {
    this.onChange.next(travel);
  }
  onPublicToggle(event: any) {
    this.travelData.isPublic = event.checked;
    this.onChange.next(this.travelData);
  }
  
}
