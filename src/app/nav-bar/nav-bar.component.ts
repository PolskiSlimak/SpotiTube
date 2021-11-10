import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { DialogCreatePlaylistComponent } from '../core/dialogs/dialog-create-playlist/dialog-create-playlist.component';
import { DialogDeletePlaylistComponent } from '../core/dialogs/dialog-delete-playlist/dialog-delete-playlist.component';
import { DialogDataCreatePlaylist } from '../core/models/dialog-data-create-playlist.interface';
import { PlaylistInfoYoutube } from '../core/models/playlist-info-youtube.interface';
import { PlaylistInfo } from '../core/models/playlist-info.interface';
import { PlaylistStorage } from '../core/models/playlist-storage.interface';
import { TrackInfo } from '../core/models/track-info.interface';
import { DetailsYoutubeService } from '../core/services/details-youtube.service';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  playlistInfo: PlaylistInfo[] = [];
  @ViewChildren('playlistHtmlLi') playlistHtml: QueryList<ElementRef>;
  playlistName: string;
  description: string;
  isPublic: boolean;
  isAddedNewPlaylist: boolean;
  isDeletedPlaylist: boolean;
  deletedPlaylists: PlaylistInfo[];

  playlistInfoYoutube: PlaylistInfoYoutube[] = this.detailsYoutubeService.playlistInfoYoutube;
  isLoggedToYoutube = this.detailsYoutubeService.getIsLoggedToYoutube();
  @ViewChildren('playlistHtmlLiYoutube') playlistHtmlYoutube: QueryList<ElementRef>;

  constructor(private detailsService: DetailsService,
              private spotifyService: SpotifyService,
              public dialog: MatDialog,
              private detailsYoutubeService: DetailsYoutubeService) { }

  ngOnInit(): void {
    this.onPlaylistLoad();
    if (this.detailsYoutubeService.getIsLoggedToYoutube()) {
      this.detailsYoutubeService.onPlaylistLoadYoutube();
    }

  }

  ngAfterViewInit() {
    this.playlistHtml.changes.subscribe(() => {
      if (this.isAddedNewPlaylist) {
        this.isAddedNewPlaylist = false;
      } else if (this.isDeletedPlaylist) {
        let itemTracks = this.detailsService.tracksInfo;
        let deletedPlaylist = this.deletedPlaylists[0];
        let foundItemTrack = itemTracks.find((itemTrack: TrackInfo) => {
          return itemTrack.playlistId === deletedPlaylist.id;
        });
        this.detailsService.manageTracks(foundItemTrack!);
        this.isDeletedPlaylist = false;
      } else {
        // this.detailsService.tracksInfo = [];
        this.checkActivePlaylists();
      }
    });
    this.playlistHtmlYoutube.changes.subscribe(() => {
      if (false) {
        //TODO
      } else {
        this.checkActivePlaylistsYoutube();
      }
    });
  }

  onPlaylistLoad(): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let items: PlaylistInfo[] = data.items;
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

  onShowMusicYoutube(event: any, item: any): void {
    this.showTracksFromCheckedPlaylistYoutube(item);
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
          this.updatePlaylistList();
        });
      }
    });
  }

  onDeletePlaylist(item: any): void {
    const dialogRef = this.dialog.open(DialogDeletePlaylistComponent, {});
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed === true) {
        this.spotifyService.deletePlaylist(item.id).subscribe((data: any) => {
          this.updatePlaylistList();
        });
      }
    });
  }

  updatePlaylistList(): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let items: PlaylistInfo[] = data.items;
      if (items) {
        if (items.length > this.playlistInfo.length) {
          this.addNewPlaylistToList(items);
        } else {
          this.deletePlaylistFromList(items);
        }
      }
    });
  }

  addNewPlaylistToList(items: PlaylistInfo[]): void {
    let newPlaylists = items.filter((playlistInfo: PlaylistInfo) => {
      let isExists = this.playlistInfo.some((playlistInfo2: PlaylistInfo) => {
        return playlistInfo.id === playlistInfo2.id;
      });
      return isExists === false;
    });
    this.isAddedNewPlaylist = true;
    this.detailsService.playlistInfo.unshift(newPlaylists[0]);
  }

  deletePlaylistFromList(items: PlaylistInfo[]): void {
    let indexOfPlaylist = this.playlistInfo.findIndex((playlistInfo: PlaylistInfo) => {
      let isExists = items.some((playlistInfo2: PlaylistInfo) => {
        return playlistInfo.id === playlistInfo2.id;
      });
      return isExists === false;
    });
    this.isDeletedPlaylist = true;
    this.deletedPlaylists = this.detailsService.playlistInfo.splice(indexOfPlaylist, 1);
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

  showTracksFromCheckedPlaylistYoutube(item: any): void {
    if (this.detailsService.isSearchPhrase === true) {
      this.clearSearch();
    }
    this.detailsYoutubeService.showMusic(item);
  }

  checkActivePlaylists(): void {
    this.detailsService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
      if (playlists.length > 0) {
        this.selectActivePlaylistsInDOM(playlists, false);
        playlists.forEach((item: PlaylistStorage) => {
          this.showTracksFromCheckedPlaylist(item);
        });
      }
    });
  }

  checkActivePlaylistsYoutube(): void {
    this.detailsYoutubeService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
      if (playlists.length > 0) {
        this.selectActivePlaylistsInDOM(playlists, true);
        playlists.forEach((item: PlaylistStorage) => {
          this.showTracksFromCheckedPlaylistYoutube(item);
        });
      }
    });
  }

  selectActivePlaylistsInDOM(playlists: PlaylistStorage[], isYoutube: boolean) {
    let childrens = this.playlistHtml;
    if (isYoutube) {
      childrens = this.playlistHtmlYoutube;
    }
    for (let children of childrens) {
      let nativeElement = children.nativeElement;
      let childNode = nativeElement.childNodes[0];
      let playlistName = childNode.innerText;
      let isChecked = playlists.some((playlist: PlaylistStorage) => {
        return playlistName === playlist.name;
      });
      if (isChecked) {
        childNode.className = childNode.className.replace("hover-btn", "clicked-btn");
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
