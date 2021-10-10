import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreatePlaylistComponent } from './dialog-create-playlist.component';

describe('DialogCreatePlaylistComponent', () => {
  let component: DialogCreatePlaylistComponent;
  let fixture: ComponentFixture<DialogCreatePlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreatePlaylistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreatePlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
