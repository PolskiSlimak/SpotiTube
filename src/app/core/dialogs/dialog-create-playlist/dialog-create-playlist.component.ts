import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataCreatePlaylist } from '../../models/dialog-data-create-playlist.interface';
import { DetailsService } from '../../services/details.service';

@Component({
  selector: 'app-dialog-create-playlist',
  templateUrl: './dialog-create-playlist.component.html',
  styleUrls: ['./dialog-create-playlist.component.scss']
})
export class DialogCreatePlaylistComponent implements OnInit {
  isLoggedToYoutube = this.detailsService.getIsLoggedToYoutube();

  constructor(public dialogRef: MatDialogRef<DialogCreatePlaylistComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogDataCreatePlaylist,
              private detailsService: DetailsService) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
