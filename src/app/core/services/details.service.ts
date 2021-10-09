import { Injectable } from '@angular/core';
import { SpotifyService } from './spotify.service';
import { Router } from '@angular/router';
import { TrackInfo } from '../models/track-info.interface';
import { ItemTrack } from '../models/item-track.interface';
import { MatPaginator } from '@angular/material/paginator';
import { of } from 'rxjs';
import { PlaylistStorage } from '../models/playlist-storage.interface';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  tracksInfo: TrackInfo[] = [];
  trackList: any = [];
  activeTrackList: any = [];
  playlistInfo: any = [];
  isSearchPhrase = false;
  pageSize = 5;
  pageIndex = 0;
  paginator: MatPaginator;

  constructor(private router: Router,
              private spotifyService: SpotifyService) { }

  setTracksInfo(item: any): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = data.items;
      this.tracksInfo.push(trackInfo);
    });
  }

  showMusic(item: any): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = data.items;
      this.addTracks(trackInfo);
    });
  }

  addTracks(trackInfo: TrackInfo): void {
    let index = this.tracksInfo.findIndex((element: any) => {
      return element.playlistId === trackInfo.playlistId;
    });
    if (index > -1) {
      this.tracksInfo.splice(index, 1);
      this.deleteRelatedTracks(trackInfo.items);
    } else {
      this.tracksInfo.push(trackInfo);
      this.updateShownTracks(trackInfo.items);
    }
    this.updateLocalStorage();
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
    this.activeTrackList.length = 0;
    this.paginator.pageIndex = 0;
    this.trackList.slice(0, this.pageSize).forEach((element: ItemTrack) => {
      this.activeTrackList.push(element);
    });
  }

  checkIfExistInDiffrentPlaylist(track: any): boolean {
    let exists = false;
    this.tracksInfo.forEach((info: any) => {
      exists = info.items.some((alreadyAddedTrack: any) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
    });
    return exists;
  }

  updateLocalStorage(): void {
    let playlistsStorage: any = [];
    this.tracksInfo.forEach((trackInfo: TrackInfo) => {
      let playlistStorage = new PlaylistStorage();
      playlistStorage.id = trackInfo.playlistId;
      playlistStorage.name = trackInfo.playlistName;
      playlistsStorage.push(playlistStorage);
    });
    this.setLocalStorageForPlaylist(playlistsStorage);
  }

  setLocalStorageForPlaylist(list: any) {
    localStorage.setItem("playlists", JSON.stringify(list));
  }

  getPlaylistsFromLocalStorage() {
    let playlists = localStorage.getItem("playlists");
    let parsedPlaylists = playlists !== null ? JSON.parse(playlists) : [];
    return of(parsedPlaylists);
  }

  getPlaylistsDOM(): any {
    return document.getElementById("playlistsHtml")!.children;
  }
}
