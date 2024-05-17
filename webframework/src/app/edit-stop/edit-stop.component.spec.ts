import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStopComponent } from './edit-stop.component';

describe('EditStopComponent', () => {
  let component: EditStopComponent;
  let fixture: ComponentFixture<EditStopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditStopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
