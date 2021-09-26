import { Component, OnInit } from '@angular/core';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  playlistInfo: any = [];

  constructor(private detailsService: DetailsService,
              private spotifyService: SpotifyService) { }

  ngOnInit(): void {
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

  onShowMusic(item: any): void {
    this.detailsService.showMusic(item);
  }

}
