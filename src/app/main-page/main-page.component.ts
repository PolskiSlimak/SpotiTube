import {Component, OnInit} from '@angular/core';
import {SpotifyService} from '../core/services/spotify.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  playlistInfo: any = [];
  tracksInfo: any = [];
  trackList: any = [];

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
    let playlistId = item.id;
    this.spotifyService.getTracks(playlistId).subscribe((data: any) => {
      this.addTracks(data.items, playlistId);
    });
  }

  addTracks(items: any, playlistId: number): void {
    let trackInfo = {items: items, playlistId: playlistId};
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
      if (index > -1 && !this.checkIfContainsInDiffrentPlaylist(newTrack)) {
        this.trackList.splice(index, 1);
      }
    });
  }

  checkIfContainsInDiffrentPlaylist(track: any): boolean {
    let exists = false;
    let isAlreadyExist = this.tracksInfo.forEach((info: any) => {
      exists = info.items.some((alreadyAddedTrack: any) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
    });
    return exists;
  }

  // getPlaylistNames(items: Object[]): string[] {
  //   let names: string[] = [];
  //   items.forEach(function (item: any) {
  //     let name = item.name;
  //     names.push(name);
  //   });
  //   return names;
  // }

  logout(): void {
    this.spotifyService.logout();
  }


  private checkRefreshToken(): void {
    if (this.spotifyService.refreshToken == null) {
      this.router.navigate(['./']);
    }
  }

}
