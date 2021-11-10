import { TestBed } from '@angular/core/testing';

import { DetailsYoutubeService } from './details-youtube.service';

describe('DetailsYoutubeService', () => {
  let service: DetailsYoutubeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailsYoutubeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
