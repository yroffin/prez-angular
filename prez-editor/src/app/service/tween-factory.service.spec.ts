import { TestBed, inject } from '@angular/core/testing';

import { TweenFactoryService } from './tween-factory.service';

describe('TweenFactoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TweenFactoryService]
    });
  });

  it('should ...', inject([TweenFactoryService], (service: TweenFactoryService) => {
    expect(service).toBeTruthy();
  }));
});
