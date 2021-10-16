import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreatePlaylistComponent } from '../core/dialogs/dialog-create-playlist/dialog-create-playlist.component';
import { DialogDeletePlaylistComponent } from '../core/dialogs/dialog-delete-playlist/dialog-delete-playlist.component';
import { DialogDataCreatePlaylist } from '../core/models/dialog-data-create-playlist.interface';
import { PlaylistStorage } from '../core/models/playlist-storage.interface';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  playlistInfo: any = [];
  @ViewChildren('playlistHtmlLi') playlistHtml: QueryList<ElementRef>;
  playlistName: string;
  description: string;
  isPublic: boolean;

  constructor(private detailsService: DetailsService,
              private spotifyService: SpotifyService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.onPlaylistLoad();
  }

  ngAfterViewInit() {
    this.playlistHtml.changes.subscribe(() => {
      this.checkActivePlaylists();
    });
  }

  onPlaylistLoad(): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let items = data.items;
      if (items) {
        this.detailsService.playlistInfo = items;
        this.playlistInfo = items;
      }
    });
  }

  onShowMusic(event: any, item: any): void {
    this.showTracksFromCheckedPlaylist(item);
    this.changeStyleOfPlaylist(event);
  }

  onCreatePlaylist(): void {
    const dialogRef = this.dialog.open(DialogCreatePlaylistComponent, {
      width: '20rem',
      data: {
        playlistName: this.playlistName,
        description: this.description,
        isPublic: this.isPublic
      }
    });
    dialogRef.afterClosed().subscribe((result: DialogDataCreatePlaylist) => {
      if (result !== undefined && result.playlistName !== undefined) {
        this.spotifyService.createPlaylist(this.detailsService.userIdn, result.playlistName, result.description, result.isPublic).subscribe((data: any) => {
          this.onPlaylistLoad();
        });
      }
    });
  }

  onDeletePlaylist(item: any): void {
    const dialogRef = this.dialog.open(DialogDeletePlaylistComponent, {});
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed === true) {
        this.spotifyService.deletePlaylist(item.id).subscribe((data: any) => {
          this.onPlaylistLoad();
        });
      }
    });
  }

  changeStyleOfPlaylist(event: any): void {
    let className = event.currentTarget.className;
    let hoverBtn = "hover-btn";
    let clickedBtn = "clicked-btn";
    if (className.includes(hoverBtn)) {
      event.currentTarget.className = className.replace(hoverBtn, clickedBtn);
    } else if (className.includes(clickedBtn)) {
      event.currentTarget.className = className.replace(clickedBtn, hoverBtn);
    }
  }

  showTracksFromCheckedPlaylist(item: any): void {
    if (this.detailsService.isSearchPhrase === true) {
      this.clearSearch();
    }
    this.detailsService.showMusic(item);
  }

  checkActivePlaylists(): void {
    this.detailsService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
      if (playlists.length > 0) {
        this.selectActivePlaylistsInDOM(playlists);
        playlists.forEach((item: any) => {
          this.showTracksFromCheckedPlaylist(item);
        });
      }
    });
  }

  selectActivePlaylistsInDOM(playlists: PlaylistStorage[]) {
    let childrens = this.playlistHtml;
    for (let children of childrens) {
      let nativeElement = children.nativeElement;
      let playlistName = nativeElement.innerText;
      let isChecked = playlists.some((playlist: PlaylistStorage) => {
        return playlistName === playlist.name;
      });
      if (isChecked) {
        nativeElement.className = nativeElement.className.replace("hover-btn", "clicked-btn");
      }
    }
  }

  clearSearch(): void {
    this.detailsService.isSearchPhrase = false;
    this.detailsService.trackList.length = 0;
    this.detailsService.tracksInfo.length = 0;
    this.detailsService.activeTrackList.length = 0;
  }
}
