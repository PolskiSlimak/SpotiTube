import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataCreatePlaylist } from '../../models/dialog-data-create-playlist.interface';
import { DetailsYoutubeService } from '../../services/details-youtube.service';

@Component({
  selector: 'app-dialog-create-playlist',
  templateUrl: './dialog-create-playlist.component.html',
  styleUrls: ['./dialog-create-playlist.component.scss']
})
export class DialogCreatePlaylistComponent implements OnInit {
  isLoggedToYoutube = this.detailsYoutubeService.getIsLoggedToYoutube();

  constructor(public dialogRef: MatDialogRef<DialogCreatePlaylistComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogDataCreatePlaylist,
              private detailsYoutubeService: DetailsYoutubeService) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
