import { Injectable } from '@angular/core';
import { ItemTrack } from '../models/item-track.interface';

@Injectable({
  providedIn: 'root'
})
export class SortService {
  sortingTypePlaylist: string = "dsc";
  sortingTypeArtist: string = "dsc";
  sortingTypeSongName: string = "dsc";
  activeSorting: string = "artist";

  constructor() { }

  chooseSortingTypeForSongs(itemTracks: ItemTrack[]): void {
    if (this.activeSorting === "artist") {
      this.sortByArist(itemTracks);
    } else {
      this.sortBySongName(itemTracks);
    }
  }

  sortPlaylist(playlist: any): void {
    if (this.sortingTypePlaylist === "dsc") {
      playlist.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (this.sortingTypePlaylist === "asc") {
      playlist.sort((a: any, b: any) => b.name.localeCompare(a.name));
    }
  }

  sortByArist(itemTracks: ItemTrack[]): void {
    if (this.sortingTypeArtist === "dsc") {
      itemTracks.sort((a: ItemTrack, b: ItemTrack) => a.track.artists[0].name.localeCompare(b.track.artists[0].name));
    } else if (this.sortingTypeArtist === "asc") {
      itemTracks.sort((a: ItemTrack, b: ItemTrack) => b.track.artists[0].name.localeCompare(a.track.artists[0].name));
    }
    this.activeSorting = "artist";
  }

  sortBySongName(itemTracks: ItemTrack[]): void {
    if (this.sortingTypeSongName === "dsc") {
      itemTracks.sort((a: ItemTrack, b: ItemTrack) => a.track.name.localeCompare(b.track.name));
    } else if (this.sortingTypeSongName === "asc") {
      itemTracks.sort((a: ItemTrack, b: ItemTrack) => b.track.name.localeCompare(a.track.name));
    }
    this.activeSorting = "songName";
  }
}
