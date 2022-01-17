import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogChooseTrack } from '../../models/dialog-choose-track.interface';

@Component({
  selector: 'app-dialog-choose-track',
  templateUrl: './dialog-choose-track.component.html',
  styleUrls: ['./dialog-choose-track.component.scss']
})
export class DialogChooseTrackComponent implements OnInit {
  trackString: string;
  albumUrl: string;
  constructor(public dialogRef: MatDialogRef<DialogChooseTrackComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogChooseTrack) { }

  ngOnInit(): void {
    let track = this.data.track;
    if (track !== undefined) {
      let artistsNames = "";
      for (let artist of track.artists) {
        let artistName = this.convertTextChars(artist.name);
        if (artistsNames === "") {
          artistsNames = artistName;
        } else {
          artistsNames = artistsNames + " & " + artistName;
        }
      }
      this.trackString = artistsNames + " - " +  track.name;
      this.albumUrl = track.album.images[2].url;
    }
  }

  convertTextChars(artistName: any): string {
    return artistName.replaceAll(/&amp;/g, '&').replaceAll(/&quot;/g, '"').replaceAll(/&#39;/g, "'");
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
