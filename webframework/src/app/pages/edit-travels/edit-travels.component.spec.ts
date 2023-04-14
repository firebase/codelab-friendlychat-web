import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTravelsComponent } from './edit-travels.component';

describe('EditTravelsComponent', () => {
  let component: EditTravelsComponent;
  let fixture: ComponentFixture<EditTravelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTravelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTravelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
