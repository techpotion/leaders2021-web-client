import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SportObjectsApiService } from './sport-objects-api.service';

import { SportObjectFilterSource } from '../models/sport-object-filter';

@Injectable({
  providedIn: 'root',
})
export class SportObjectFilterService {

  constructor(
    private readonly api: SportObjectsApiService,
  ) { }

  public createDepartmentalOrganizationNamesFilter(
  ): Observable<SportObjectFilterSource> {
    return this.api.getDepartmentalOrganizationNames().pipe(
      map(names => ({
        name: 'Ведомственная принадлежность',
        variants: names,
        apiName: 'departmentalOrganizationNames',
      })),
    );
  }

  public createSportAreaNamesFilter(): Observable<SportObjectFilterSource> {
    return this.api.getSportAreaNames().pipe(
      map(names => ({
        name: 'Спортивные зоны',
        variants: names,
        apiName: 'sportsAreaNames',
      })),
    );
  }

  public createSportAreaTypesFilter(): Observable<SportObjectFilterSource> {
    return this.api.getSportAreaTypes().pipe(
      map(types => ({
        name: 'Типы спортивных зон',
        variants: types,
        apiName: 'sportsAreaTypes',
      })),
    );
  }

  public createSportKindsFilter(): Observable<SportObjectFilterSource> {
    return this.api.getSportKinds().pipe(
      map(kinds => ({
        name: 'Виды спортивных услуг',
        variants: kinds,
        apiName: 'sportKinds',
      })),
    );
  }

  public createSportObjectAvailabilityFilter(): SportObjectFilterSource {
    return {
      name: 'Близость',
      variants: [
        { index: 4, name: 'Шаговая' },
        { index: 3, name: 'Районная' },
        { index: 2, name: 'Окружная' },
        { index: 1, name: 'Городская' },
      ],
      apiName: 'availabilities',
    };
  }

}
