import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-delete-playlist',
  templateUrl: './dialog-delete-playlist.component.html',
  styleUrls: ['./dialog-delete-playlist.component.scss']
})
export class DialogDeletePlaylistComponent implements OnInit {
  message: string = "Czy na pewno usunąć wybraną listę utworów?";
  confirmButtonText: string = "Tak";
  cancelButtonText: string = "Nie";

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
