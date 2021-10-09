import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { PlaylistStorage } from '../core/models/playlist-storage.interface';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  playlistInfo: any = [];
  @ViewChildren('playlistHtmlLi') playlistHtml: QueryList<ElementRef>;

  constructor(private detailsService: DetailsService,
              private spotifyService: SpotifyService) { }

  ngOnInit(): void {
    this.onPlaylistLoad();
  }

  ngAfterViewInit() {
    this.playlistHtml.changes.subscribe(() => {
      this.checkActivePlaylists();
    });
  }

  onPlaylistLoad(): void {
    this.spotifyService.getPlaylists().subscribe((data: any) => {
      let items = data.items;
      if (items) {
        this.detailsService.playlistInfo = items;
        this.playlistInfo = items;
      }
    });
  }

  onShowMusic(event: any, item: any): void {
    this.showTracksFromCheckedPlaylist(item);
    this.changeStyleOfPlaylist(event);
  }

  changeStyleOfPlaylist(event: any): void {
    let className = event.currentTarget.className;
    let hoverBtn = "hover-btn";
    let clickedBtn = "clicked-btn";
    if (className.includes(hoverBtn)) {
      event.currentTarget.className = className.replace(hoverBtn, clickedBtn);
    } else if (className.includes(clickedBtn)) {
      event.currentTarget.className = className.replace(clickedBtn, hoverBtn);
    }
  }

  showTracksFromCheckedPlaylist(item: any): void {
    if (this.detailsService.isSearchPhrase === true) {
      this.clearSearch();
    }
    this.detailsService.showMusic(item);
  }

  checkActivePlaylists(): void {
    this.detailsService.getPlaylistsFromLocalStorage().subscribe((playlists: PlaylistStorage[]) => {
      if (playlists.length > 0) {
        this.selectActivePlaylistsInDOM(playlists);
        playlists.forEach((item: any) => {
          this.showTracksFromCheckedPlaylist(item);
        });
      }
    });
  }

  selectActivePlaylistsInDOM(playlists: PlaylistStorage[]) {
    let childrens = this.playlistHtml;
    for (let children of childrens) {
      let nativeElement = children.nativeElement;
      let playlistName = nativeElement.innerText;
      let isChecked = playlists.some((playlist: PlaylistStorage) => {
        return playlistName === playlist.name;
      });
      if (isChecked) {
        nativeElement.className = nativeElement.className.replace("hover-btn", "clicked-btn");
      }
    }
  }

  clearSearch(): void {
    this.detailsService.isSearchPhrase = false;
    this.detailsService.trackList.length = 0;
    this.detailsService.tracksInfo.length = 0;
    this.detailsService.activeTrackList.length = 0;
  }
}
