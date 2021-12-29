import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogModifyPlaylistComponent } from './dialog-modify-playlist.component';

describe('DialogModifyPlaylistComponent', () => {
  let component: DialogModifyPlaylistComponent;
  let fixture: ComponentFixture<DialogModifyPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogModifyPlaylistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogModifyPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
