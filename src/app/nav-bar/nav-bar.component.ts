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

  onShowMusic(event: any, item: any): void {
    let className = event.currentTarget.className;
    let hoverBtn = "hover-btn";
    let clickedBtn = "clicked-btn";
    if (className.includes(hoverBtn)) {
      event.currentTarget.className = className.replace(hoverBtn, clickedBtn);
    } else if (className.includes(clickedBtn)) {
      event.currentTarget.className = className.replace(clickedBtn, hoverBtn);
    }
    this.detailsService.showMusic(item);
  }

}
