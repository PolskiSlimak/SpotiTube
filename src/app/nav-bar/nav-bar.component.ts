import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreatePlaylistComponent } from '../core/dialogs/dialog-create-playlist/dialog-create-playlist.component';
import { DialogDeletePlaylistComponent } from '../core/dialogs/dialog-delete-playlist/dialog-delete-playlist.component';
import { DialogDataCreatePlaylist } from '../core/models/dialog-data-create-playlist.interface';
import { PhraseStorage } from '../core/models/phrase-storage.interface';
import { PlaylistInfoYoutube } from '../core/models/playlist-info-youtube.interface';
import { PlaylistInfo } from '../core/models/playlist-info.interface';
import { PlaylistStorage } from '../core/models/playlist-storage.interface';
import { TrackInfo } from '../core/models/track-info.interface';
import { DetailsYoutubeService } from '../core/services/details-youtube.service';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';
import { YoutubeService } from '../core/services/youtube.service';
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
  deletedPlaylistsYoutube: PlaylistInfoYoutube[];

  constructor(private detailsService: DetailsService,
              private spotifyService: SpotifyService,
              public dialog: MatDialog,
              private detailsYoutubeService: DetailsYoutubeService,
              private youtubeSerivce: YoutubeService) { }

  ngOnInit(): void {
    this.onPlaylistLoad();
    if (this.detailsYoutubeService.getIsLoggedToYoutube()) {
      this.detailsYoutubeService.onPlaylistLoadYoutube();
    }
  }

  ngAfterViewInit() {
    this.playlistHtml.changes.subscribe(() => {
      this.checkWhatToDo();
    });
    this.playlistHtmlYoutube.changes.subscribe(() => {
      this.checkWhatToDoYoutube();
    });
  }

  checkWhatToDo(): void {
    let phraseStorage: PhraseStorage = this.detailsService.getPhraseFromLocalStorage();
    if (this.isAddedNewPlaylist) {
      this.isAddedNewPlaylist = false;
    } else if (this.isDeletedPlaylist) {
      this.deletePlaylist();
    } else if (phraseStorage !== null && !phraseStorage.isYoutubePhrase) {
      this.searchAgain(phraseStorage.phrase);
    } else {
      this.checkActivePlaylists();
    }
  }

  checkWhatToDoYoutube(): void {
    let phraseStorage: PhraseStorage = this.detailsService.getPhraseFromLocalStorage();
    if (this.isAddedNewPlaylist) {
      this.isAddedNewPlaylist = false;
    } else if (this.isDeletedPlaylist) {
      this.deletePlaylistYoutube();
    } else if (phraseStorage !== null && phraseStorage.isYoutubePhrase) {
      this.searchAgainYoutube(phraseStorage.phrase);
    } else {
      this.checkActivePlaylistsYoutube();
    }
  }

  deletePlaylist(): void {
    let itemTracks = this.detailsService.tracksInfo;
    let deletedPlaylist = this.deletedPlaylists[0];
    let foundItemTrack = itemTracks.find((itemTrack: TrackInfo) => {
      return itemTrack.playlistId === deletedPlaylist.id;
    });
    if (foundItemTrack) {
      this.detailsService.manageTracks(foundItemTrack);
    }
    this.isDeletedPlaylist = false;
  }

  deletePlaylistYoutube(): void {
    let itemTracks = this.detailsService.tracksInfo;
    let deletedPlaylist = this.deletedPlaylistsYoutube[0];
    let foundItemTrack = itemTracks.find((itemTrack: TrackInfo) => {
      return itemTrack.playlistId === deletedPlaylist.id;
    });
    if (foundItemTrack) {
      this.detailsYoutubeService.manageTracks(foundItemTrack);
    }
    this.isDeletedPlaylist = false;
  }

  searchAgain(phrase: string): void {
    this.detailsService.removeLocalStoragePlaylist();
    this.detailsService.searchInSpotify(phrase);
  }

  searchAgainYoutube(phrase: string): void {
    this.detailsService.removeLocalStoragePlaylist();
    this.detailsYoutubeService.searchInYoutube(phrase);
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
    this.detailsService.themeColor = "";
    this.showTracksFromCheckedPlaylist(item);
    this.changeStyleOfPlaylist(event);
  }

  onShowMusicYoutube(event: any, item: any): void {
    this.detailsService.themeColor = "";
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
        if (result.isYoutube) {
          this.youtubeSerivce.createPlaylist(result.playlistName, result.description, result.isPublic).subscribe((data: any) => {
            this.updatePlaylistYoutube(true);
          });
        } else {
          this.spotifyService.createPlaylist(this.detailsService.userIdn, result.playlistName, result.description, result.isPublic).subscribe((data: any) => {
            this.updatePlaylistList(true);
          });
        }
      }
    });
  }

  onDeletePlaylist(item: any): void {
    const dialogRef = this.dialog.open(DialogDeletePlaylistComponent, {});
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed === true) {
        if (item instanceof PlaylistInfoYoutube) {
          this.youtubeSerivce.deletePlaylist(item.id).subscribe((data: any) => {
            this.updatePlaylistYoutube(false);
          });
        } else {
          this.spotifyService.deletePlaylist(item.id).subscribe((data: any) => {
            this.updatePlaylistList(false);
          });
        }
      }
    });
  }

  updatePlaylistList(isCreatePlaylist: boolean): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let items: PlaylistInfo[] = data.items;
      if (items) {
        if (isCreatePlaylist) {
          this.addNewPlaylistToList(items);
        } else {
          this.deletePlaylistFromList(items);
        }
      }
    });
  }

  updatePlaylistYoutube(isCreatePlaylist: boolean): void {
    this.youtubeSerivce.getPlaylists().subscribe((data: any) => {
      let items = data.items;
      if (items) {
        let playlistItems: PlaylistInfoYoutube[] = [];
        data.items.forEach((element:any) => {
          let item = new PlaylistInfoYoutube();
          item.id = element.id;
          item.etag = element.id;
          item.kind = element.kind;
          item.name = element.snippet.title;
          playlistItems.push(item);
        });
        if (isCreatePlaylist) {
          this.addNewPlaylistToListYoutube(playlistItems);
        } else {
          this.deletePlaylistFromListYoutube(playlistItems);
        }
      }
    })
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

  addNewPlaylistToListYoutube(items: PlaylistInfoYoutube[]): void {
    let newPlaylists = items.filter((playlistInfo: PlaylistInfoYoutube) => {
      let isExists = this.detailsYoutubeService.playlistInfoYoutube.some((playlistInfo2: PlaylistInfoYoutube) => {
        return playlistInfo.id === playlistInfo2.id;
      });
      return isExists === false;
    });
    this.isAddedNewPlaylist = true;
    if (newPlaylists.length > 0) {
      this.detailsYoutubeService.playlistInfoYoutube.unshift(newPlaylists[0]);
    } else {
      this.updatePlaylistYoutube(true);
    }
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

  deletePlaylistFromListYoutube(items: PlaylistInfoYoutube[]): void {
    let indexOfPlaylist = this.detailsYoutubeService.playlistInfoYoutube.findIndex((playlistInfo: PlaylistInfoYoutube) => {
      let isExists = items.some((playlistInfo2: PlaylistInfoYoutube) => {
        return playlistInfo.id === playlistInfo2.id;
      });
      return isExists === false;
    });
    this.isDeletedPlaylist = true;
    this.deletedPlaylistsYoutube = this.detailsYoutubeService.playlistInfoYoutube.splice(indexOfPlaylist, 1);
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
        playlists.forEach((item: PlaylistStorage) => {
          if (this.selectActivePlaylistsInDOMAndCheckExist(item, false)) {
            this.showTracksFromCheckedPlaylist(item);
          }
        });
      }
    });
  }

  checkActivePlaylistsYoutube(): void {
    this.detailsYoutubeService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
      if (playlists.length > 0) {
        playlists.forEach((item: PlaylistStorage) => {
          if (this.selectActivePlaylistsInDOMAndCheckExist(item, true)) {
            this.showTracksFromCheckedPlaylistYoutube(item);
          }
        });
      }
    });
  }

  selectActivePlaylistsInDOMAndCheckExist(playlistStorage: PlaylistStorage, isYoutube: boolean): boolean {
    let childrens = this.playlistHtml;
    let isExists = false;
    if (isYoutube) {
      childrens = this.playlistHtmlYoutube;
    }
    for (let children of childrens) {
      let nativeElement = children.nativeElement;
      let childNode = nativeElement.childNodes[0];
      let playlistName = childNode.innerText;
      let isChecked = playlistName === playlistStorage.name;
      if (isChecked) {
        childNode.className = childNode.className.replace("hover-btn", "clicked-btn");
        isExists = true;
      }
    }
    return isExists;
  }

  clearSearch(): void {
    this.detailsService.isSearchPhrase = false;
    this.detailsService.trackList.length = 0;
    this.detailsService.tracksInfo.length = 0;
    this.detailsService.activeTrackList.length = 0;
    this.detailsService.removePhraseFromLocalStorage();
  }
}
