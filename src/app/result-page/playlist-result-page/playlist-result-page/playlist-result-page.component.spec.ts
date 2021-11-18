import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistResultPageComponent } from './playlist-result-page.component';

describe('PlaylistResultPageComponent', () => {
  let component: PlaylistResultPageComponent;
  let fixture: ComponentFixture<PlaylistResultPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistResultPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistResultPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
