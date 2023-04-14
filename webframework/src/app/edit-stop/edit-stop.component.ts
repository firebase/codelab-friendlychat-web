import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Stop, StopObject } from 'src/app/models/travel.model';
import { TravelService } from 'src/app/services/travel.service';

@Component({
  selector: 'app-edit-stop',
  templateUrl: './edit-stop.component.html',
  styleUrls: ['./edit-stop.component.scss']
})
export class EditStopComponent {
  @Output('on-change') onChange = new EventEmitter<Partial<Stop>>();
  @Input() stops: Stop[] = [];
  @Input() travelId: string = '';
  @Input() addStop!: (travelId: string) => void;
  @Input() deleteStop!: (stopId: string) => void;
  @Input() uploadFileToStop!: (file: HTMLInputElement, stop:Partial<Stop>) => void;
  stopsList: Stop[] = [];
  travelService: TravelService = inject(TravelService);
  
  ngOnInit() {
    this.stops.forEach(stop => {
      this.stopsList.push(
        {...stop}
      )
    })
  }

  onUpdate(st: Partial<Stop>) {
    this.onChange.next(st);
  }

  uploadFile(input: HTMLInputElement, st: Partial<Stop>) {
    this.uploadFileToStop(input, st);
  }

}
