import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataModifyPlaylist } from '../../models/dialog-data-modify-playlist.interface';
import { DetailsYoutubeService } from '../../services/details-youtube.service';

@Component({
  selector: 'app-dialog-modify-playlist',
  templateUrl: './dialog-modify-playlist.component.html',
  styleUrls: ['./dialog-modify-playlist.component.scss']
})
export class DialogModifyPlaylistComponent implements OnInit {
  isLoggedToYoutube = this.detailsYoutubeService.getIsLoggedToYoutube();

  constructor(public dialogRef: MatDialogRef<DialogModifyPlaylistComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogDataModifyPlaylist,
              private detailsYoutubeService: DetailsYoutubeService) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
