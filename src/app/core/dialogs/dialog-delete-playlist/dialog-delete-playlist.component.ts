import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-delete-playlist',
  templateUrl: './dialog-delete-playlist.component.html',
  styleUrls: ['./dialog-delete-playlist.component.scss']
})
export class DialogDeletePlaylistComponent implements OnInit {
  message: string = "Are you sure want to delete?";
  confirmButtonText: string = "Yes";
  cancelButtonText: string = "No";

  constructor(public dialogRef: MatDialogRef<DialogDeletePlaylistComponent>) { }

  ngOnInit(): void {
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
