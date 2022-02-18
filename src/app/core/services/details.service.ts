import { Injectable } from '@angular/core';
import { SpotifyService } from './spotify.service';
import { TrackInfo } from '../models/track-info.interface';
import { ItemTrack } from '../models/item-track.interface';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PlaylistStorage } from '../models/playlist-storage.interface';
import { PlaylistInfo } from '../models/playlist-info.interface';
import { PhraseStorage } from '../models/phrase-storage.interface';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  tracksInfo: TrackInfo[] = [];
  trackList: any = [];
  refreshTrackList$ = new BehaviorSubject<any>([]);
  activeTrackList: any = [];
  refreshActiveTrackList$ = new BehaviorSubject<any>([]);
  playlistInfo: PlaylistInfo[] = [];
  isSearchPhrase = false;
  pageSize = 10;
  pageIndex = 0;
  paginator: MatPaginator;
  userIdn: string;
  isLastPage: boolean = true;
  refreshTracksInfo$ = new BehaviorSubject<TrackInfo[]>([]);
  phraseValue: any;
  themeColor: string;
  isMenuOpen: boolean;
  filterInput: any;

  constructor(private spotifyService: SpotifyService,
              private sortService: SortService) { }

  setTracksInfo(item: PlaylistInfo): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = data.items;
      this.tracksInfo.push(trackInfo);
      this.refreshTracksInfo$.next(this.tracksInfo);
    });
  }

  showMusic(item: any): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = data.items;
      this.manageTracks(trackInfo);
    });
  }

  manageTracks(trackInfo: TrackInfo): void {
    let index = this.tracksInfo.findIndex((element: TrackInfo) => {
      return element.playlistId === trackInfo.playlistId;
    });
    if (index > -1) {
      this.tracksInfo.splice(index, 1);
      this.tracksInfo = this.tracksInfo.slice();
      this.deleteRelatedTracks(trackInfo.items);
      this.refreshTracksInfo$.next(this.tracksInfo);
      this.setThemeForDeletingPlaylist();
    } else {
      this.tracksInfo = [...this.tracksInfo, trackInfo];
      this.updateShownTracks(trackInfo.items);
      this.refreshTracksInfo$.next(this.tracksInfo);
      this.setThemeForAddingPlaylist()
    }
    if (this.isSearchPhrase === true) {
      this.isSearchPhrase = false;
    }
    this.refreshTrackList$.next(this.trackList);
    this.updateLocalStorage();
  }

  setThemeForDeletingPlaylist(): void {
    if (this.tracksInfo.length === 0) {
      this.themeColor = "";
    } else if (!this.isCheckedAnyPlaylistFromSpotify() && this.tracksInfo.length > 0) {
      this.themeColor = "youtube";
    }
  }

  setThemeForAddingPlaylist(): void {
    if (this.themeColor === "youtube" && !this.isSearchPhrase) {
      this.themeColor = "spotify-youtube";
    } else if (this.themeColor !== "spotify-youtube" || (this.isSearchPhrase && this.themeColor === "spotify-youtube")) {
      this.themeColor = "spotify";
    }
  }

  updateShownTracks(itemTracks: ItemTrack[]): void {
    itemTracks.forEach((newTrack: ItemTrack) => {
      let isAlreadyExist = this.trackList.some((alreadyAddedTrack: ItemTrack) => {
        return alreadyAddedTrack.track.id === newTrack.track.id;
      });
      if (!isAlreadyExist) {
        this.trackList.push(newTrack);
        if (this.activeTrackList.length < this.pageSize) {
          this.activeTrackList.push(newTrack)
        }
      }
    });
  }

  deleteRelatedTracks(itemTracks: ItemTrack[]): void {
    itemTracks.forEach((newTrack: ItemTrack) => {
      let index = this.trackList.findIndex((alreadyAddedTrack: ItemTrack) => {
        return alreadyAddedTrack.track.id === newTrack.track.id;
      });
      if (index > -1 && !this.checkIfExistInDiffrentPlaylist(newTrack)) {
        this.trackList.splice(index, 1);
      }
    });
    if (this.isSearchPhrase != true) {
      this.activeTrackList.length = 0;
      this.paginator.pageIndex = 0;
      this.trackList.slice(0, this.pageSize).forEach((element: ItemTrack) => {
        this.activeTrackList.push(element);
      });
    }
  }

  checkIfExistInDiffrentPlaylist(track: ItemTrack): boolean {
    let exists = false;
    for (let info of this.tracksInfo) {
      exists = info.items.some((alreadyAddedTrack: any) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
      if (exists) {
        break;
      }
    }
    return exists;
  }

  updateLocalStorage(): void {
    let playlistsStorage: PlaylistStorage[] = [];
    this.tracksInfo.forEach((trackInfo: TrackInfo) => {
      let playlistStorage = new PlaylistStorage();
      playlistStorage.id = trackInfo.playlistId;
      playlistStorage.name = trackInfo.playlistName;
      playlistsStorage.push(playlistStorage);
    });
    this.setLocalStorageForPlaylist(playlistsStorage);
  }

  setLocalStorageForPlaylist(list: PlaylistStorage[]): void {
    localStorage.setItem("playlists", JSON.stringify(list));
  }

  removeLocalStoragePlaylist(): void {
    localStorage.removeItem("playlists");
  }

  getPlaylistsFromLocalStorage(): Observable<PlaylistStorage[]> {
    let playlists = localStorage.getItem("playlists");
    let parsedPlaylists = playlists !== null && playlists !== '' ? JSON.parse(playlists) : [];
    return of(parsedPlaylists);
  }

  getPlaylistsDOM(): any {
    return document.getElementById("playlistsHtml")!.children;
  }

  setPhraseToLocalStorage(formattedPhrase: PhraseStorage): void {
      localStorage.setItem("phraseToSearch", JSON.stringify(formattedPhrase));
  }

  removePhraseFromLocalStorage(): void {
    localStorage.removeItem("phraseToSearch");
  }

  getPhraseFromLocalStorage(): PhraseStorage {
    let phrase = localStorage.getItem("phraseToSearch");
    return phrase !== null && phrase !== '' ? JSON.parse(phrase): null;
  }

  searchInSpotify(formattedPhrase: string): void {
    this.spotifyService.searchForPhrase(formattedPhrase, "track").subscribe((data: any) => {
      this.phraseValue = "";
      this.isSearchPhrase = true;
      this.themeColor = "spotify";
      this.sortService.sortingTypeArtist = "dsc";
      this.sortService.sortingTypeSongName = "dsc";
      this.putTracks(data["tracks"].items);
      this.setAllPlaylistsActive();
      this.setPhraseToLocalStorage({
        phrase: formattedPhrase,
      });
    });
  }

  putTracks(items: any): void {
    this.trackList.length = 0;
    this.activeTrackList.length = 0;
    items.forEach((item: any) => {
      this.trackList.push({track: item})
      if (this.activeTrackList.length < this.pageSize) {
        this.activeTrackList.push({track: item})
      }
    });
    this.refreshTrackList$.next(this.trackList);
  }

  setAllPlaylistsActive(): void {
    this.clearHtmlSelected();
    this.clearTracksInfo();
    let playlists = this.playlistInfo;
    playlists.forEach((element: PlaylistInfo) => {
      this.setTracksInfo(element);
    });
  }

  clearHtmlSelected(): void {
    let childrens = this.getPlaylistsDOM();
    let isLoggedToYoutube = this.getIsLoggedToYoutube();
    if (!isLoggedToYoutube) {
      for (let childDiv of childrens) {
        if (childDiv.childNodes[0].className)
          childDiv.childNodes[0].className = childDiv.childNodes[0].className.replace("clicked-btn", "hover-btn");
      }
    } else {
      for (let childDiv of childrens) {
        let allDivChildrens = childDiv.children
        for (let children of allDivChildrens) {
          if (children.childNodes[0].className)
            children.childNodes[0].className = children.childNodes[0].className.replace("clicked-btn", "hover-btn");
        }
      }
    }
  }

  clearTracksInfo(): void {
    this.tracksInfo.length = 0;
    this.updateLocalStorage();
  }

  isCheckedAnyPlaylistFromSpotify(): boolean {
    return this.tracksInfo.some((trackInfo: TrackInfo) => {
      return this.isSpotifyPlaylist(trackInfo)
    });
  }

  isSpotifyPlaylist(item: any): boolean {
    let playlistInfo = this.playlistInfo;
    return playlistInfo.some((playlistInfo: PlaylistInfo) => {
      return playlistInfo.id === item.playlistId;
    });
  }

  getIsLoggedToYoutube(): boolean {
    let isLogged = sessionStorage.getItem("isLoggedToYoutube");
    let converted = isLogged !== null && isLogged !== '' ? JSON.parse(isLogged) : false;
    return converted;
  }
}
