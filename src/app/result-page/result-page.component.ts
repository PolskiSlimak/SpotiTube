import { Component, OnInit, ViewChild } from '@angular/core';
import { DetailsService } from '../core/services/details.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ItemTrack } from '../core/models/item-track.interface';
import { SortService } from '../core/services/sort.service';
import { MatTableDataSource } from '@angular/material/table';
import { ArtistsInfo } from '../core/models/artists-info.interface';

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
  trackListFiltered = new MatTableDataSource(this.trackList);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public detailsService: DetailsService,
              public sortService: SortService) { }

  ngOnInit(): void {
    this.trackListFiltered.filterPredicate = (itemTrack: ItemTrack, filter: string) => {
      let filterConverted = filter.split("-");
      if (filterConverted.length > 1) {
        return this.filterByArtistAndSongName(itemTrack, filterConverted);
      } else {
        return this.filterByArtistOrSongName(itemTrack, filter);
      }
     };
    this.detailsService.refreshTrackList$.subscribe((trackList: ItemTrack[]) => {
      if (this.isSortBySongName) {
        this.sortService.sortBySongName(trackList);
      } else {
        this.sortService.sortByArist(trackList);
      }
      this.trackList = [...trackList];
      this.detailsService.trackList = this.trackList;
      this.getCurrentActiveTrackList();
    });
    this.detailsService.refreshActiveTrackList$.subscribe((activeTrackList: ItemTrack[]) => {
      this.detailsService.activeTrackList = activeTrackList;
      this.activeTrackList = [...activeTrackList];
    });
  }

  ngAfterViewInit(): void {
    this.detailsService.paginator = this.paginator;
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

  getCurrentActiveTrackList(): void {
    let firstIndex = this.pageSize * this.pageIndex;
    let lastIndex = firstIndex + this.pageSize;
    this.activeTrackList = this.trackList.slice(firstIndex, lastIndex);
    this.detailsService.refreshActiveTrackList$.next(this.activeTrackList);
  }

  onApplyFilter(eventTarget: any): void {
    let filterText = eventTarget.value;
    this.trackListFiltered.filter = filterText.trim().toLocaleLowerCase();
    this.detailsService.refreshTrackList$.next(this.trackListFiltered.filteredData);
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
}
