import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeletePlaylistComponent } from './dialog-delete-playlist.component';

describe('DialogDeletePlaylistComponent', () => {
  let component: DialogDeletePlaylistComponent;
  let fixture: ComponentFixture<DialogDeletePlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDeletePlaylistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeletePlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
