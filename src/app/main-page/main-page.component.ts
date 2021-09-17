import {Component, OnInit} from '@angular/core';
import {SpotifyService} from '../core/services/spotify.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  playlistInfo = [];
  trackInfo = [];

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
      console.log(data);
    });
  }

  showMusic(item: any): any {
    let playlistId = item.id;
    this.spotifyService.getTracks(playlistId).subscribe((data: any) => {
      this.trackInfo = data.items;
      console.log(this.trackInfo)
    });
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
