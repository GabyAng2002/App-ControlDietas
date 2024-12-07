import { TestBed } from '@angular/core/testing';

import { CaloriasService } from './calorias.service';

describe('CaloriasService', () => {
  let service: CaloriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaloriasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
