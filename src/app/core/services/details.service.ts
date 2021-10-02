import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SpotifyService } from './spotify.service';
import { Router } from '@angular/router';
import { TrackInfo } from '../models/track-info.interface';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  tracksInfo: any = [];
  trackList: any = [];
  playlistInfo: any = [];
  isSearchPhrase = false;

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
  }

  updateShownTracks(itemTracks: any): void {
    itemTracks.forEach((newTrack: any) => {
      let isAlreadyExist = this.trackList.some((alreadyAddedTrack: any) => {
        return alreadyAddedTrack.track.id === newTrack.track.id;
      });
      if (!isAlreadyExist) {
        this.trackList.push(newTrack);
      }
    });
  }

  deleteRelatedTracks(itemTracks: any): void {
    itemTracks.forEach((newTrack: any) => {
      let index = this.trackList.findIndex((alreadyAddedTrack: any) => {
        return alreadyAddedTrack.track.id === newTrack.track.id;
      });
      if (index > -1 && !this.checkIfExistInDiffrentPlaylist(newTrack)) {
        this.trackList.splice(index, 1);
      }
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

}
