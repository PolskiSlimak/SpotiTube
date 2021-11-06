import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackYoutubeComponent } from './callback-youtube.component';

describe('CallbackYoutubeComponent', () => {
  let component: CallbackYoutubeComponent;
  let fixture: ComponentFixture<CallbackYoutubeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallbackYoutubeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackYoutubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
