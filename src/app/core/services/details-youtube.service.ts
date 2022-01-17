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
import { SortService } from './sort.service';
import { YoutubeService } from './youtube.service';

@Injectable({
  providedIn: 'root'
})
export class DetailsYoutubeService {
  playlistInfoYoutube: PlaylistInfoYoutube[] = [];
  isSearchYoutube: boolean = false;

  constructor(private youtubeService: YoutubeService,
              private detailsService: DetailsService,
              private sortService: SortService) {

  }

  setTracksInfo(item: PlaylistInfoYoutube): void {
    let trackInfo = new TrackInfo();
    trackInfo.playlistId = item.id;
    trackInfo.playlistName = item.name;
    this.youtubeService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = this.convertItemTrack(data.items);
      this.detailsService.tracksInfo.push(trackInfo);
      this.detailsService.refreshTracksInfo$.next(this.detailsService.tracksInfo);
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
      track.id = snippet.resourceId.videoId;
      track.uri = element.id;

      let album = this.getAlbumImages(snippet);
      track.album = album;

      let artistsInfo = this.getArtistAndName(snippet, track, false);
      track.artists = [];
      track.artists.push(artistsInfo);

      itemTrack.track = track;
      itemTrack.isYoutubeResource = true;
      itemTracks.push(itemTrack);
    }
    return itemTracks;
  }

  getAlbumImages(snippet: any): AlbumInfo {
    let album = new AlbumInfo();
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
    return album;
  }

  getArtistAndName(snippet: any, trackData: TrackData, isForSearch: boolean): ArtistsInfo {
    let artistAndName = snippet.title.split("-");
    let artistsInfo = new ArtistsInfo();
    if (artistAndName.length == 1) {
      if (isForSearch) {
        artistsInfo.name = snippet.channelTitle.split("-")[0];
      } else {
        artistsInfo.name = snippet.videoOwnerChannelTitle.split("-")[0];
      }
      trackData.name = this.parseTrackName(artistAndName[0]);
    } else {
      if (isForSearch) {
        artistsInfo.name = snippet.channelTitle.split("-")[0];
      } else {
        artistsInfo.name = snippet.videoOwnerChannelTitle !== undefined ? snippet.videoOwnerChannelTitle.split("-")[0] : artistAndName[0];
      }
      trackData.name = this.parseTrackName(artistAndName[1]);
    }
    return artistsInfo;
  }

  parseTrackName(artistName: any): string {
    return artistName.replaceAll(/&amp;/g, '&').replaceAll(/&quot;/g, '"').replaceAll(/&#39;/g, "'");
  }

  onPlaylistLoadYoutube(): void {
    this.youtubeService.getPlaylists().subscribe((data: any) => {
      data.items.forEach((element:any) => {
        let item = this.convertToPlaylistInfoYoutube(element);
        this.playlistInfoYoutube.push(item);
      });
      this.sortService.sortPlaylist(this.playlistInfoYoutube);
    });
  }

  convertToPlaylistInfoYoutube(element: any): PlaylistInfoYoutube {
    let item = new PlaylistInfoYoutube();
    item.id = element.id;
    item.etag = element.etag;
    item.kind = element.kind;
    item.name = element.snippet.title;
    return item;
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
      this.detailsService.refreshTracksInfo$.next(this.detailsService.tracksInfo);
      if (this.detailsService.tracksInfo.length === 0) {
        this.detailsService.themeColor = "";
      } else if (!this.isCheckedAnyPlaylistFromYoutube() && this.detailsService.tracksInfo.length > 0) {
        this.detailsService.themeColor = "spotify";
      }
    } else {
      this.detailsService.tracksInfo.push(trackInfo);
      this.detailsService.updateShownTracks(trackInfo.items);
      this.detailsService.refreshTracksInfo$.next(this.detailsService.tracksInfo);
      if (this.detailsService.themeColor === "spotify" && !this.detailsService.isSearchPhrase) {
        this.detailsService.themeColor = "spotify-youtube";
      } else if (this.detailsService.themeColor !== "spotify-youtube") {
        this.detailsService.themeColor = "youtube";
      }
    }
    if (this.detailsService.isSearchPhrase === true) {
      this.detailsService.isSearchPhrase = false;
    }
    this.detailsService.refreshTrackList$.next(this.detailsService.trackList);
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

  searchInYoutube(formattedPhrase: string): void {
    this.youtubeService.searchForPhrase(formattedPhrase).subscribe((data: any) => {
      this.detailsService.phraseValue = "";
      this.detailsService.isSearchPhrase = true;
      this.detailsService.themeColor = "youtube";
      this.sortService.sortingTypeArtist = "dsc";
      this.sortService.sortingTypeSongName = "dsc";
      this.putTracksYoutube(data.items);
      this.setAllPlaylistsActiveYoutube();
      this.detailsService.setPhraseToLocalStorage({
        phrase: formattedPhrase,
        isYoutubePhrase: true
      });
    });
  }

  putTracksYoutube(items: any): void {
    this.detailsService.trackList.length = 0;
    this.detailsService.activeTrackList.length = 0;
    items.forEach((item: any) => {
      let snippet = item.snippet;
      let convertedItem = new TrackData();
      convertedItem.id = item.id.videoId;
      convertedItem.uri; //uri nie jest potrzebne bo nie jest na zadnej playliscie

      let album = this.getAlbumImages(snippet);
      convertedItem.album = album;

      let artistsInfo = this.getArtistAndName(snippet, convertedItem, true);
      convertedItem.artists = [];
      convertedItem.artists.push(artistsInfo);

      let itemTrack = new ItemTrack();
      itemTrack.track = convertedItem;
      itemTrack.isYoutubeResource = true;
      this.detailsService.trackList.push(itemTrack)
      if (this.detailsService.activeTrackList.length < this.detailsService.pageSize) {
        this.detailsService.activeTrackList.push(itemTrack)
      }
    });
    this.detailsService.refreshTrackList$.next(this.detailsService.trackList);
  }

  convertItemTrackFromSearched(item: any): ItemTrack {
    let snippet = item.snippet;
    let convertedItem = new TrackData();
    convertedItem.id = item.id.videoId;
    convertedItem.uri;
    let album = this.getAlbumImages(snippet);
    convertedItem.album = album;
    let artistsInfo = this.getArtistAndName(snippet, convertedItem, true);
    convertedItem.artists = [];
    convertedItem.artists.push(artistsInfo);
    let itemTrack = new ItemTrack();
    itemTrack.track = convertedItem;
    itemTrack.isYoutubeResource = true;
    return itemTrack;
  }

  setAllPlaylistsActiveYoutube(): void {
    this.detailsService.clearHtmlSelected();
    this.clearTracksInfoYoutube();
    let playlists = this.playlistInfoYoutube;
    playlists.forEach((element: PlaylistInfoYoutube) => {
      this.setTracksInfo(element);
    });
  }

  clearTracksInfoYoutube(): void {
    this.detailsService.tracksInfo.length = 0;
    this.updateLocalStorage();
  }

  isCheckedAnyPlaylistFromYoutube(): boolean {
     return this.detailsService.tracksInfo.some((trackInfo: TrackInfo) => {
      return this.isYoutubePlaylist(trackInfo);
    });
  }

  isYoutubePlaylist(item: TrackInfo): boolean {
    let playlistInfoYoutube = this.playlistInfoYoutube;
    return playlistInfoYoutube.some((playlistInfo: PlaylistInfoYoutube) => {
      return playlistInfo.id === item.playlistId;
    });
  }
}
