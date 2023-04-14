import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTravelComponent } from './edit-travel.component';

describe('EditTravelComponent', () => {
  let component: EditTravelComponent;
  let fixture: ComponentFixture<EditTravelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTravelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTravelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
