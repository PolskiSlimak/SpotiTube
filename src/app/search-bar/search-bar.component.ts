import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
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
  showProfile = false;
  pictureUrl = "https://i1.wp.com/similarpng.com/wp-content/plugins/userswp/assets/images/no_profile.png?ssl=1";
  isLoggedToYoutube: boolean;

  constructor(private spotifyService: SpotifyService,
              public detailsService: DetailsService,
              private youtubeService: YoutubeService,
              private detailsYoutubeService: DetailsYoutubeService,
              private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.onProfileLoad();
    let isLogged = sessionStorage.getItem("isLoggedToYoutube");
    this.isLoggedToYoutube = isLogged !== null && isLogged !== '' ? JSON.parse(isLogged) : this.detailsService.getIsLoggedToYoutube();
  }

  @HostListener('document:click', ['$event'])
  public clickout(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showProfile = false;
    }
  }

  onLoginToYoutube(): void {
    this.youtubeService.youtubeAuth();
  }

  onSearchForPhrase(): void {
    if (!this.phraseValue) {
      return
    }
    this.detailsService.filterInput.nativeElement.value = "";
    let formattedPhrase = this.phraseValue.replace(" ", "+");
    this.detailsService.searchInSpotify(formattedPhrase);
    if (this.isLoggedToYoutube) {
      formattedPhrase = this.phraseValue.replace(" ", "%20");
      this.detailsYoutubeService.searchInYoutube(formattedPhrase);
    }
    this.phraseValue = "";
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
    localStorage.removeItem("phraseToSearch");
    this.youtubeService.accessToken = '';
    this.youtubeService.refreshToken = '';
  }

  onLogoutFromYoutube(): void {
    this.isLoggedToYoutube = false;
    localStorage.setItem('playlistsYoutube', "");
    sessionStorage.setItem("isLoggedToYoutube", "false");
    localStorage.removeItem("phraseToSearch");
    this.youtubeService.logout();
  }

  onToggleMenu(): void {
    this.detailsService.isMenuOpen = !this.detailsService.isMenuOpen;
  }
}
