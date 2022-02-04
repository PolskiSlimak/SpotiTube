import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { DetailsService } from '../core/services/details.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ItemTrack } from '../core/models/item-track.interface';
import { SortService } from '../core/services/sort.service';
import { MatTableDataSource } from '@angular/material/table';
import { ArtistsInfo } from '../core/models/artists-info.interface';
import { DetailsYoutubeService } from '../core/services/details-youtube.service';
import { PlaylistInfo } from '../core/models/playlist-info.interface';
import { PlaylistInfoYoutube } from '../core/models/playlist-info-youtube.interface';
import { BehaviorSubject } from 'rxjs';
import { SpotifyService } from '../core/services/spotify.service';
import { YoutubeService } from '../core/services/youtube.service';

@Component({
  selector: 'app-result-page',
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.scss']
})
export class ResultPageComponent implements OnInit {
  trackList: ItemTrack[] = this.detailsService.trackList;
  activeTrackList: any = this.detailsService.activeTrackList;
  pageSize = this.detailsService.pageSize;
  pageIndex = this.detailsService.pageIndex;
  isLastPage: boolean = this.detailsService.isLastPage;
  isSortBySongName: boolean = false;
  trackListFiltered: MatTableDataSource<any> = new MatTableDataSource();
  innerWidth: number
  allTrackList: ItemTrack[];
  isTracksListInitialized$ = new BehaviorSubject<boolean>(false);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('filterInput') filterInput: Input;

  constructor(public detailsService: DetailsService,
              public sortService: SortService,
              private detailsYoutubeService: DetailsYoutubeService,
              private spotifyService: SpotifyService,
              private youtubeService: YoutubeService) { }

  ngOnInit(): void {
    this.trackListFiltered.filterPredicate = (itemTrack: any, filter: string) => {
      let filterConverted = filter.split("-");
      if (filterConverted.length > 1) {
        return this.filterByArtistAndSongName(itemTrack, filterConverted);
      } else {
        return this.filterByArtistOrSongName(itemTrack, filter);
      }
     };
    this.detailsService.refreshTrackList$.subscribe((trackList: ItemTrack[]) => {
      if (!this.detailsService.isSearchPhrase) {
        if (this.isSortBySongName) {
          this.sortService.sortBySongName(trackList);
        } else {
          this.sortService.sortByArist(trackList);
        }
      }
      this.trackList = [...trackList];
      this.getCurrentActiveTrackList();
    });
    this.detailsService.refreshActiveTrackList$.subscribe((activeTrackList: ItemTrack[]) => {
      this.detailsService.activeTrackList = activeTrackList;
      this.activeTrackList = [...activeTrackList];
    });
    this.resizeListener();
  }

  ngAfterViewInit(): void {
    this.detailsService.paginator = this.paginator;
    this.detailsService.filterInput = this.filterInput;
    this.translatePaginator();
  }

  @HostListener('window:resize', ['$event'])
  resizeListener() {
    this.innerWidth = window.innerWidth;
  }

  onPageChange(event: PageEvent): void {
    const startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    let isLastPage = false;
    if (endIndex >= this.trackList.length) {
      endIndex = this.trackList.length;
      isLastPage = true;
    }
    this.activeTrackList.length = 0;
    this.trackList.slice(startIndex, endIndex).forEach((element: any) => {
      this.activeTrackList.push(element);
    });
    this.detailsService.pageSize = event.pageSize;
    this.pageSize = this.detailsService.pageSize;
    this.pageIndex = event.pageIndex;
    this.detailsService.isLastPage = isLastPage;
    this.isLastPage = this.detailsService.isLastPage;
    this.detailsService.refreshActiveTrackList$.next(this.activeTrackList);
  }

  onChangeSortArtist(): void {
    this.isSortBySongName = false;
    this.sortService.sortingTypeArtist = this.sortService.sortingTypeArtist === "dsc" ? "asc" : "dsc";
    this.sortService.sortByArist(this.trackList);
    this.getCurrentActiveTrackList();
  }

  onChangeSortSongName(): void {
    this.isSortBySongName = true;
    this.sortService.sortingTypeSongName = this.sortService.sortingTypeSongName === "dsc" ? "asc" : "dsc";
    this.sortService.sortBySongName(this.trackList);
    this.getCurrentActiveTrackList();
  }

  initAllTrackListForFilter() {
    this.allTrackList = [];
    this.detailsService.playlistInfo.forEach((playlistInfo: PlaylistInfo) => {
      this.spotifyService.getTracks(playlistInfo.id).subscribe((data: any) => {
        let itemTracks: ItemTrack[] = data.items;
        itemTracks.forEach((newItemTrack: ItemTrack) => {
          let isAlreadyExist = this.allTrackList.some((alreadyAddedTrack: ItemTrack) => {
            return alreadyAddedTrack.track.id === newItemTrack.track.id;
          });
          if (!isAlreadyExist) {
            this.allTrackList.push(newItemTrack);
          }
        });
        this.isTracksListInitialized$.next(true);
      });
    });
    this.detailsYoutubeService.playlistInfoYoutube.forEach((playlistInfoYoutube: PlaylistInfoYoutube) => {
      this.youtubeService.getTracks(playlistInfoYoutube.id).subscribe((data: any) => {
        let itemTracks: ItemTrack[] = this.detailsYoutubeService.convertItemTrack(data.items);
        itemTracks.forEach((newItemTrack: ItemTrack) => {
          let isAlreadyExist = this.allTrackList.some((alreadyAddedTrack: ItemTrack) => {
            return alreadyAddedTrack.track.id === newItemTrack.track.id;
          });
          if (!isAlreadyExist) {
            this.allTrackList.push(newItemTrack);
          }
        });
        this.isTracksListInitialized$.next(true);
      });
    });
  }

  getCurrentActiveTrackList(): void {
    let firstIndex = this.pageSize * this.pageIndex;
    let lastIndex = firstIndex + this.pageSize;
    this.activeTrackList = this.trackList.slice(firstIndex, lastIndex);
    this.detailsService.refreshActiveTrackList$.next(this.activeTrackList);
  }

  onApplyFilter(eventTarget: any): void {
    let filterText = eventTarget.value;
    if (filterText != "") {
      this.detailsService.setAllPlaylistsActive();
      this.detailsYoutubeService.setAllPlaylistsActiveYoutube();
      this.initAllTrackListForFilter();
      this.isTracksListInitialized$.subscribe((value: boolean) => {
        if (value) {
          this.trackListFiltered.data = this.allTrackList;
          this.detailsService.isSearchPhrase = true;
          this.trackListFiltered.filter = filterText.trim().toLocaleLowerCase();
          this.detailsService.refreshTrackList$.next(this.trackListFiltered.filteredData);
        }
      });
    } else if (filterText == "") {
      this.detailsService.refreshTrackList$.next([]);
    }
  }

  filterByArtistAndSongName(itemTrack: ItemTrack, filterConverted: any): boolean {
    let artistPart = filterConverted[0].trim();
    let songNamePart = filterConverted[1].trim();
    let artist = itemTrack.track.artists.find((artist: ArtistsInfo) => {
      return artist.name.toLocaleLowerCase().includes(artistPart);
    });
    let trackNameFound = itemTrack.track.name.toLocaleLowerCase().includes(songNamePart);
    return artist !== undefined && trackNameFound;
  }

  filterByArtistOrSongName(itemTrack: ItemTrack, filter: string): boolean {
    let trimmedFilter = filter.trim();
    let artist = itemTrack.track.artists.find((artist: ArtistsInfo) => {
      return artist.name.toLocaleLowerCase().includes(trimmedFilter);
    });
    let trackNameFound = itemTrack.track.name.toLocaleLowerCase().includes(trimmedFilter);
    return artist !== undefined || trackNameFound;
  }

  translatePaginator(): void {
    this.paginator._intl.itemsPerPageLabel = 'Wyniki na stronę';
    this.paginator._intl.firstPageLabel = 'Pierwsza strona';
    this.paginator._intl.lastPageLabel = 'Ostatnia strona';
    this.paginator._intl.nextPageLabel = 'Następna strona';
    this.paginator._intl.previousPageLabel = 'Poprzednia strona';
    this.paginator._intl.getRangeLabel = (page, pageSize, length) => {
      if (length == 0 || pageSize == 0) {
          return `0 z ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ?
          Math.min(startIndex + pageSize, length) :
          startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} z ${length}`;
    };
  }
}
