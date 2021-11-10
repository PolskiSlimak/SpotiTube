import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AlbumInfo } from '../models/album-info.interface';
import { ArtistsInfo } from '../models/artists-info.interface';
import { ItemTrack } from '../models/item-track.interface';
import { PlaylistInfoYoutube } from '../models/playlist-info-youtube.interface';
import { PlaylistStorage } from '../models/playlist-storage.interface';
import { TrackData } from '../models/track-data.interface';
import { TrackInfo } from '../models/track-info.interface';
import { DetailsService } from './details.service';
import { YoutubeService } from './youtube.service';

@Injectable({
  providedIn: 'root'
})
export class DetailsYoutubeService {
  playlistInfoYoutube: PlaylistInfoYoutube[] = [];
  playlistInfo: PlaylistInfoYoutube[] = [];
  constructor(private youtubeService: YoutubeService,
              private detailsService: DetailsService) {

  }

  setTracksInfo(item: PlaylistInfoYoutube): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.youtubeService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = this.convertItemTrack(data.items);
      this.detailsService.tracksInfo.push(trackInfo);
    });
  }

  convertItemTrack(items: any): ItemTrack[] {
    let itemTracks: ItemTrack[] = [];
    for (let element of items) {
      let snippet = element.snippet;
      if (snippet.description === "This video is unavailable." || snippet.description === "This video is private.") {
        continue;
      }
      let itemTrack = new ItemTrack();
      let track = new TrackData();
      let album = new AlbumInfo();

      track.id = element.id;
      track.uri = snippet.resourceId.videoId

      album.images = [];
      album.images.push({
        url: snippet.thumbnails.default.url
      });
      album.images.push({
        url: snippet.thumbnails.medium.url
      });
      album.images.push({
        url: snippet.thumbnails.high.url
      });
      track.album = album;

      let artistAndName = snippet.title.split("-");
      track.artists = [];
      let artistsInfo = new ArtistsInfo();
      if (artistAndName.length == 1) {
        artistsInfo.name = snippet.videoOwnerChannelTitle.split("-")[0];
        track.name = artistAndName[0];
      } else {
        artistsInfo.name = artistAndName[0];
        track.name = artistAndName[1] ? artistAndName[1]: "";
      }
      track.artists.push(artistsInfo);

      itemTrack.track = track;
      itemTracks.push(itemTrack)
    }
    return itemTracks;
  }

  onPlaylistLoadYoutube(): void {
    this.youtubeService.getPlaylists().subscribe((data: any) => {
      data.items.forEach((element:any) => {
        let item = new PlaylistInfoYoutube();
        item.id = element.id;
        item.etag = element.id;
        item.kind = element.kind;
        item.name = element.snippet.title;
        this.playlistInfoYoutube.push(item);
      });
    });
  }

  showMusic(item: any): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.youtubeService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = this.convertItemTrack(data.items);
      this.manageTracks(trackInfo);
    });
  }

  manageTracks(trackInfo: TrackInfo): void {
    let index = this.detailsService.tracksInfo.findIndex((element: TrackInfo) => {
      return element.playlistId === trackInfo.playlistId;
    });
    if (index > -1) {
      this.detailsService.tracksInfo.splice(index, 1);
      this.detailsService.deleteRelatedTracks(trackInfo.items);
    } else {
      this.detailsService.tracksInfo.push(trackInfo);
      this.detailsService.updateShownTracks(trackInfo.items);
    }
    this.updateLocalStorage();
  }

  updateLocalStorage(): void {
    let playlistsStorage: PlaylistStorage[] = [];
    this.detailsService.tracksInfo.forEach((trackInfo: TrackInfo) => {
      let playlistStorage = new PlaylistStorage();
      playlistStorage.id = trackInfo.playlistId;
      playlistStorage.name = trackInfo.playlistName;
      playlistsStorage.push(playlistStorage);
    });
    this.setLocalStorageForPlaylist(playlistsStorage);
  }

  setLocalStorageForPlaylist(list: PlaylistStorage[]) {
    localStorage.setItem("playlistsYoutube", JSON.stringify(list));
  }

  getPlaylistsFromLocalStorage(): Observable<PlaylistStorage[]> {
    let playlists = localStorage.getItem("playlistsYoutube");
    let parsedPlaylists = playlists !== null && playlists !== '' ? JSON.parse(playlists) : [];
    return of(parsedPlaylists);
  }

  getIsLoggedToYoutube(): boolean {
    let isLogged = sessionStorage.getItem("isLoggedToYoutube");
    let converted = isLogged !== null && isLogged !== '' ? JSON.parse(isLogged) : false;
    return converted;
  }
}
