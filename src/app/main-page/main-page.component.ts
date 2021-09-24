import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../core/services/spotify.service';
import { Router } from '@angular/router';
import { TrackInfo } from '../core/models/track-info.interface';

@Component({
  selector: 'app-main',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  playlistInfo: any = [];
  tracksInfo: any = [];
  trackList: any = [];
  phraseValue: any;
  optionsForFrom = [
    { name: 'track' },
    { name: 'artist' },
    { name: 'album' }
  ];
  selectedOption: string = this.optionsForFrom[0].name;
  itemsFound: any = [];

  constructor(private router: Router,
              private spotifyService: SpotifyService) {
  }

  ngOnInit(): void {
    this.checkRefreshToken();
    this.onPlaylistLoad();
  }

  onPlaylistLoad(): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let items = data.items;
      if (items) {
        this.playlistInfo = items;
      }
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

  checkIfExistInPlaylist(item: any, trackInfo: TrackInfo): boolean {
    let exists = false;
    exists = trackInfo.items.some((song: any) => {
      return song.track.id === item.track.id;
    });
    return exists;
  }

  manageSongOnPlaylist(item: any, trackInfo: TrackInfo): void {
    let exists = this.checkIfExistInPlaylist(item, trackInfo);
    let trackUri = item.track.uri;
    if (exists) {
      this.spotifyService.deleteTrackFromPlaylist(trackInfo.playlistId, {uri:trackUri}).subscribe(() => {
        this.refreshTracks(trackInfo);
        if (!this.checkIfExistInMorePlaylists(item)) {
          let index = this.trackList.findIndex((alreadyAddedTrack: any) => {
            return alreadyAddedTrack.track.id === item.track.id;
          });
          this.trackList.splice(index, 1);
        }
      });
    } else {
      this.spotifyService.addTrackToPlaylist(trackInfo.playlistId, trackUri).subscribe(() => {
        this.refreshTracks(trackInfo);
      });
    }
  }

  checkIfExistInMorePlaylists(track: any): boolean {
    let records = [];
    let elements = 0;
    this.tracksInfo.forEach((info: any) => {
      records = info.items.filter((alreadyAddedTrack: any) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
      elements = elements + records.length;
    });
    return elements > 1;
  }

  refreshTracks(trackInfo: TrackInfo): void {
    this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
      trackInfo.items = data.items;
      let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
        return trackInfoAdded.playlistId === trackInfo.playlistId;
      });
      this.tracksInfo[indexOfTrackInfo] = trackInfo;
    });
  }

  searchForPhrase() {
    let formattedPhrase = this.phraseValue.replace(" ", "+");
    this.spotifyService.searchForPhrase(formattedPhrase, this.selectedOption).subscribe((data: any) => {
      let searchedType = this.selectedOption + "s";
      this.itemsFound = data[searchedType].items;
      this.phraseValue = "";
    });
  }

  logout(): void {
    this.spotifyService.logout();
  }

  private checkRefreshToken(): void {
    if (this.spotifyService.refreshToken == null) {
      this.router.navigate(['./']);
    }
  }

}
