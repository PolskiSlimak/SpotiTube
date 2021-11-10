import { Component, OnInit } from '@angular/core';
import { AlbumInfo } from '../core/models/album-info.interface';
import { PlaylistInfoYoutube } from '../core/models/playlist-info-youtube.interface';
import { PlaylistInfo } from '../core/models/playlist-info.interface';
import { TrackData } from '../core/models/track-data.interface';
import { DetailsYoutubeService } from '../core/services/details-youtube.service';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';
import { YoutubeService } from '../core/services/youtube.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  phraseValue: any;
  isSearchYoutube: boolean;
  // optionsForFrom = [
  //   { name: 'track' },
  //   { name: 'album' }
  // ];
  // selectedOption: string = this.optionsForFrom[0].name;
  showProfile = false;
  pictureUrl = "https://i1.wp.com/similarpng.com/wp-content/plugins/userswp/assets/images/no_profile.png?ssl=1";
  isLoggedToYoutube: boolean;

  constructor(private spotifyService: SpotifyService,
              private detailsService: DetailsService,
              private youtubeService: YoutubeService,
              private detailsYoutubeService: DetailsYoutubeService) { }

  ngOnInit(): void {
    this.onProfileLoad();
    let isLogged = sessionStorage.getItem("isLoggedToYoutube");
    this.isLoggedToYoutube = isLogged !== null && isLogged !== '' ? JSON.parse(isLogged) : false;
  }

  onLoginToYoutube(): void {
    this.youtubeService.youtubeAuth();
  }

  onSwitchSearch(): void {
    this.isSearchYoutube = !this.isSearchYoutube;
  }

  onSearchForPhrase(): void {
    let formattedPhrase = this.phraseValue.replace(" ", "+");
    this.spotifyService.searchForPhrase(formattedPhrase, "track").subscribe((data: any) => {
      // let searchedType = "track" + "s";
      this.phraseValue = "";
      this.putTracks(data["tracks"].items);
      this.detailsService.isSearchPhrase = true;
      this.setAllPlaylistsActive();
    });
  }

  onSearchForPhraseYoutube(): void {
    let formattedPhrase = this.phraseValue.replace(" ", "%20");
    this.youtubeService.searchForPhrase(formattedPhrase).subscribe((data: any) => {
      // let searchedType = "track" + "s";
      this.phraseValue = "";
      this.putTracksYoutube(data.items);
      this.detailsService.isSearchPhrase = true;
      this.setAllPlaylistsActiveYoutube();
    });
  }

  onProfileLoad(): void {
    this.spotifyService.getUserData().subscribe((data: any) => {
      this.detailsService.userIdn = data.id;
      let images = data.images;
      if (images.length > 0) {
        this.pictureUrl = images[0].url;
      }
    });
  }

  onShowProfile(): void {
    this.showProfile = !this.showProfile;
  }

  onGetShowProfile(): boolean {
    return this.showProfile;
  }

  onLogout(): void {
    this.spotifyService.logout();
    this.isLoggedToYoutube = false;
    sessionStorage.setItem("isLoggedToYoutube", "false");
    localStorage.setItem('playlistsYoutube', "");
    this.youtubeService.accessToken = '';
    this.youtubeService.refreshToken = '';
  }

  onLogoutFromYoutube(): void {
    this.isLoggedToYoutube = false;
    localStorage.setItem('playlistsYoutube', "");
    sessionStorage.setItem("isLoggedToYoutube", "false");
    this.youtubeService.logout();
  }

  putTracks(items: any): void {
    this.detailsService.trackList.length = 0;
    this.detailsService.activeTrackList.length = 0;
    items.forEach((item: any) => {
      this.detailsService.trackList.push({track: item})
      if (this.detailsService.activeTrackList.length < this.detailsService.pageSize) {
        this.detailsService.activeTrackList.push({track: item})
      }
    });
  }

  putTracksYoutube(items: any): void {
    this.detailsService.trackList.length = 0;
    this.detailsService.activeTrackList.length = 0;
    items.forEach((item: any) => {
      let convertedItem = new TrackData();
      let album = new AlbumInfo();
      album.images = item.snippet.thumbnails;
      convertedItem.album = album;
      let artistAndName = item.snippet.title.split("-");
      convertedItem.artists = artistAndName[0];
      convertedItem.artists = artistAndName[1] ? artistAndName[1]: "";
      this.detailsService.trackList.push({track: convertedItem})
      if (this.detailsService.activeTrackList.length < this.detailsService.pageSize) {
        this.detailsService.activeTrackList.push({track: item})
      }
    });
  }

  setAllPlaylistsActive(): void {
    this.clearHtmlSelected();
    this.clearTracksInfo();
    let playlists = this.detailsService.playlistInfo;
    playlists.forEach((element: PlaylistInfo) => {
      this.detailsService.setTracksInfo(element);
    });
  }

  setAllPlaylistsActiveYoutube(): void {
    this.clearHtmlSelected();
    this.clearTracksInfoYoutube();
    let playlists = this.detailsYoutubeService.playlistInfo;
    playlists.forEach((element: PlaylistInfoYoutube) => {
      this.detailsYoutubeService.setTracksInfo(element);
    });
  }

  clearHtmlSelected(): void {
    let childrens = this.detailsService.getPlaylistsDOM();
    for (let children of childrens) {
      children.childNodes[0].className = children.childNodes[0].className.replace("clicked-btn", "hover-btn");
    }
  }

  clearTracksInfo(): void {
    this.detailsService.tracksInfo.length = 0;
    this.detailsService.updateLocalStorage();
  }

  clearTracksInfoYoutube(): void {
    this.detailsService.tracksInfo.length = 0;
    this.detailsYoutubeService.updateLocalStorage();
  }
}
