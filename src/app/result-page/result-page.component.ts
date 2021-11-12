import { Component, OnInit, ViewChild } from '@angular/core';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';
import { TrackInfo } from '../core/models/track-info.interface';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ItemTrack } from '../core/models/item-track.interface';
import { DetailsYoutubeService } from '../core/services/details-youtube.service';
import { YoutubeService } from '../core/services/youtube.service';

@Component({
  selector: 'app-result-page',
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.scss']
})
export class ResultPageComponent implements OnInit {
  tracksInfo: TrackInfo[] = this.detailsService.tracksInfo;
  trackList: ItemTrack[] = this.detailsService.trackList;
  activeTrackList: any = this.detailsService.activeTrackList;
  pageSize = this.detailsService.pageSize;
  pageIndex = this.detailsService.pageIndex;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private spotifyService: SpotifyService,
              private detailsService: DetailsService,
              private detailsYoutubeService: DetailsYoutubeService,
              private youtubeService: YoutubeService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.detailsService.paginator = this.paginator;
  }

  onManageSongOnPlaylist(item: ItemTrack, trackInfo: TrackInfo): void {
    let exists = this.checkIfExistInPlaylist(item, trackInfo);
    let trackUri = item.track.uri;
    if (item.isYoutubeResource) {
      if (exists) {
        this.youtubeService.deleteTrackFromPlaylist(trackUri).subscribe(() => {
          this.refreshTracksInfo(trackInfo, true);
          if (!this.checkIfExistInMorePlaylists(item)) {
            this.refreshTrackList(item);
          }
        });
      } else {
        this.youtubeService.addTrackToPlaylist(trackInfo.playlistId, item.track.id).subscribe(() => {
          this.refreshTracksInfo(trackInfo, true);
        });
      }
    } else {
      if (exists) {
        this.spotifyService.deleteTrackFromPlaylist(trackInfo.playlistId, {uri:trackUri}).subscribe(() => {
          this.refreshTracksInfo(trackInfo, false);
          if (!this.checkIfExistInMorePlaylists(item)) {
            this.refreshTrackList(item);
          }
        });
      } else {
        this.spotifyService.addTrackToPlaylist(trackInfo.playlistId, trackUri).subscribe(() => {
          this.refreshTracksInfo(trackInfo, false);
        });
      }
    }
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
    this.detailsService.isLastPage = isLastPage;
  }

  refreshTracksInfo(trackInfo: TrackInfo, isYoutube: boolean): void {
    if (isYoutube) {
      this.youtubeService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
        trackInfo.items = this.detailsYoutubeService.convertItemTrack(data.items);
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
      });
    } else {
      this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
        trackInfo.items = data.items;
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
      });
    }
  }

  refreshTrackList(track: ItemTrack): void {
    let index = this.trackList.findIndex((alreadyAddedTrack: ItemTrack) => {
      return alreadyAddedTrack.track.id === track.track.id;
    });
    this.trackList.splice(index, 1);
    let indexOFActive = this.activeTrackList.findIndex((alreadyAddedTrack: ItemTrack) => {
      return alreadyAddedTrack.track.id === track.track.id;
    });
    this.activeTrackList.splice(indexOFActive, 1);
    if (!this.detailsService.isLastPage) {
      this.activeTrackList.push(this.trackList[this.detailsService.pageSize - 1]);
    }
  }

  checkIfExistInPlaylist(item: ItemTrack, trackInfo: TrackInfo): boolean {
    let exists = false;
    exists = trackInfo.items.some((song: ItemTrack) => {
      return song.track.id === item.track.id;
    });
    return exists;
  }

  checkIfExistInMorePlaylists(track: ItemTrack): boolean {
    let records = [];
    let elements = 0;
    this.tracksInfo.forEach((info: TrackInfo) => {
      records = info.items.filter((alreadyAddedTrack: ItemTrack) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
      elements = elements + records.length;
    });
    return elements > 1;
  }
}
