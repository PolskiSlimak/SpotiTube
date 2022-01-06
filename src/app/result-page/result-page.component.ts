import { Component, OnInit, ViewChild } from '@angular/core';
import { DetailsService } from '../core/services/details.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ItemTrack } from '../core/models/item-track.interface';
import { SortService } from '../core/services/sort.service';

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

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public detailsService: DetailsService,
              public sortService: SortService) { }

  ngOnInit(): void {
    this.detailsService.refreshActiveTrackList$.subscribe((activeTrackList: ItemTrack[]) => {
      if (this.isSortBySongName) {
        this.sortService.sortBySongName(activeTrackList);
      } else {
        this.sortService.sortByArist(activeTrackList);
      }
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
    this.detailsService.refreshActiveTrackList$.next(this.activeTrackList);
  }

  onChangeSortSongName(): void {
    this.isSortBySongName = true;
    this.sortService.sortingTypeSongName = this.sortService.sortingTypeSongName === "dsc" ? "asc" : "dsc";
    this.detailsService.refreshActiveTrackList$.next(this.activeTrackList);
  }
}
