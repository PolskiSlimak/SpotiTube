import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreatePlaylistComponent } from '../core/dialogs/dialog-create-playlist/dialog-create-playlist.component';
import { DialogDeletePlaylistComponent } from '../core/dialogs/dialog-delete-playlist/dialog-delete-playlist.component';
import { DialogModifyPlaylistComponent } from '../core/dialogs/dialog-modify-playlist/dialog-modify-playlist.component';
import { DialogDataCreatePlaylist } from '../core/models/dialog-data-create-playlist.interface';
import { DialogDataModifyPlaylist } from '../core/models/dialog-data-modify-playlist.interface';
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
  isModifiedPlaylist: boolean;
  isChangedSortingType: boolean;
  isDeletedPlaylist: boolean;
  deletedPlaylists: PlaylistInfo[];

  playlistInfoYoutube: PlaylistInfoYoutube[] = this.detailsYoutubeService.playlistInfoYoutube;
  isLoggedToYoutube = this.detailsYoutubeService.getIsLoggedToYoutube();
  @ViewChildren('playlistHtmlLiYoutube') playlistHtmlYoutube: QueryList<ElementRef>;
  deletedPlaylistsYoutube: PlaylistInfoYoutube[];

  constructor(public detailsService: DetailsService,
              private spotifyService: SpotifyService,
              public dialog: MatDialog,
              private detailsYoutubeService: DetailsYoutubeService,
              private youtubeSerivce: YoutubeService) { }

  ngOnInit(): void {
    this.refreshPlaylists();
  }

  ngAfterViewInit() {
    this.playlistHtml.changes.subscribe(() => {
      this.checkWhatToDo();
    });
    this.playlistHtmlYoutube.changes.subscribe(() => {
      this.checkWhatToDoYoutube();
    });
  }

  refreshPlaylists(): void {
    this.onPlaylistLoad();
    if (this.detailsYoutubeService.getIsLoggedToYoutube()) {
      this.detailsYoutubeService.onPlaylistLoadYoutube();
    }
  }

  checkWhatToDo(): void {
    let phraseStorage: PhraseStorage = this.detailsService.getPhraseFromLocalStorage();
    if (this.isAddedNewPlaylist) {
      this.isAddedNewPlaylist = false;
    } else if (this.isDeletedPlaylist) {
      this.deletePlaylist();
    } else if (this.isChangedSortingType) {
      if (this.playlistInfoYoutube.length == 0) {
        this.isChangedSortingType = false;
      }
    } else if (this.isModifiedPlaylist) {
      this.isModifiedPlaylist = false;
      this.detailsService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
        if (playlists.length > 0) {
          playlists.forEach((item: PlaylistStorage) => {
            this.selectActivePlaylistsInDOMAndCheckExist(item, false);
          });
        }
      });
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
    } else if (this.isChangedSortingType) {
      this.isChangedSortingType = false;
    } else if (this.isModifiedPlaylist) {
      this.isModifiedPlaylist = false;
      this.detailsYoutubeService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
        if (playlists.length > 0) {
          playlists.forEach((item: PlaylistStorage) => {
            this.selectActivePlaylistsInDOMAndCheckExist(item, true);
          });
        }
      });
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
        this.detailsService.sortPlaylist(items);
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

  onChangeSorting(newSortType: string): void {
    this.detailsService.sortingType = newSortType;
    this.refreshPlaylistInfo();
    this.refreshPlaylistInfoYoutube()
    this.isChangedSortingType = true;
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

  onEditPlaylist(item: any): void {
    const dialogRef = this.dialog.open(DialogModifyPlaylistComponent, {
      width: '20rem',
      data: {
        playlistName: this.playlistName,
        description: this.description,
        isPublic: this.isPublic
      }
    });
    dialogRef.afterClosed().subscribe((result: DialogDataModifyPlaylist) => {
      if (result !== undefined && result.playlistName !== undefined) {
        if (item instanceof PlaylistInfoYoutube) {
          this.youtubeSerivce.modifyPlaylist(item.id, result.playlistName, result.description, result.isPublic).subscribe((data: any) => {
            this.updatePlaylistYoutubeAfterModify(data);
          });
        } else {
          this.spotifyService.modifyPlaylistInfo(item.id, result.playlistName, result.description, result.isPublic).subscribe((data: any) => {
            this.updatePlaylistAfterModify(item);
          });
        }
      }
    });
  }

  updatePlaylistAfterModify(item: PlaylistInfo): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let newPlaylistInfo : PlaylistInfo = data.items.filter((newPlaylistInfo: PlaylistInfo) => {
        return newPlaylistInfo.id === item.id;
      })[0];
      let indexOfOldPlaylistInfo = this.playlistInfo.findIndex((oldPlaylistInfo: PlaylistInfo) => {
        return oldPlaylistInfo.id === newPlaylistInfo.id;
      });
      this.playlistInfo[indexOfOldPlaylistInfo] = newPlaylistInfo;
      this.refreshPlaylistInfo();
      this.refreshTracksInfoAfterModify(newPlaylistInfo);
      this.detailsService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
        if (playlists.length > 0) {
          playlists.forEach((item: PlaylistStorage) => {
            if (item.id === newPlaylistInfo.id) {
              item.name = newPlaylistInfo.name;
            }
          });
          this.detailsService.setLocalStorageForPlaylist(playlists);
        }
      });
      this.isModifiedPlaylist = true;
    });
  }

  updatePlaylistYoutubeAfterModify(data: any): void {
    let newPlaylistInfoYoutube = this.detailsYoutubeService.convertToPlaylistInfoYoutube(data);
    let indexOfOldPlaylistInfo = this.playlistInfoYoutube.findIndex((oldPlaylistInfo: PlaylistInfoYoutube) => {
      return oldPlaylistInfo.id === newPlaylistInfoYoutube.id;
    });
    this.playlistInfoYoutube[indexOfOldPlaylistInfo] = newPlaylistInfoYoutube;
    this.refreshPlaylistInfoYoutube();
    this.refreshTracksInfoAfterModify(newPlaylistInfoYoutube);
    this.detailsYoutubeService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
      if (playlists.length > 0) {
        playlists.forEach((item: PlaylistStorage) => {
          if (item.id === newPlaylistInfoYoutube.id) {
            item.name = newPlaylistInfoYoutube.name;
          }
        });
        this.detailsYoutubeService.setLocalStorageForPlaylist(playlists);
      }
    });
    this.isModifiedPlaylist = true;
  }

  refreshPlaylistInfo(): void {
    this.detailsService.sortPlaylist(this.playlistInfo);
    this.playlistInfo = [...this.playlistInfo];
  }

  refreshPlaylistInfoYoutube(): void {
    this.detailsService.sortPlaylist(this.playlistInfoYoutube);
    this.playlistInfoYoutube = [...this.playlistInfoYoutube];
  }

  refreshTracksInfoAfterModify(newPlaylistInfo: any): void {
    this.detailsService.tracksInfo.forEach((trackInfo: TrackInfo) => {
      if (trackInfo.playlistId === newPlaylistInfo.id) {
        trackInfo.playlistName = newPlaylistInfo.name;
      }
    });
    this.detailsService.refreshTracksInfo$.next(this.detailsService.tracksInfo);
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
    this.playlistInfo = this.detailsService.playlistInfo;
    this.detailsService.sortPlaylist(this.playlistInfo);
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
      this.playlistInfoYoutube = this.detailsYoutubeService.playlistInfoYoutube;
      this.detailsService.sortPlaylist(this.playlistInfoYoutube);
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
    this.playlistInfo = this.detailsService.playlistInfo;
    this.refreshPlaylistInfo();
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
    this.playlistInfoYoutube = this.detailsYoutubeService.playlistInfoYoutube;
    this.refreshPlaylistInfoYoutube();
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
    this.detailsService.trackList.length = 0;
    this.detailsService.tracksInfo.length = 0;
    this.detailsService.activeTrackList.length = 0;
    this.detailsService.removePhraseFromLocalStorage();
  }
}
