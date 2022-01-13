import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChooseTrackComponent } from './dialog-choose-track.component';

describe('DialogChooseTrackComponent', () => {
  let component: DialogChooseTrackComponent;
  let fixture: ComponentFixture<DialogChooseTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogChooseTrackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogChooseTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
