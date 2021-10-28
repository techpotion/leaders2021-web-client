import { Injectable } from '@angular/core';

import { SportPolygon } from '../models/sport-polygon';


const POLYGON_STORAGE_KEY = 'polygon-storage';

@Injectable({
  providedIn: 'root',
})
export class SportPolygonService {

  constructor() { }

  public savePolygon(polygon: SportPolygon): void {
    const polygons = this.getPolygons();
    polygons.push(polygon);
    this.updatePolygons(polygons);
  }

  public updatePolygons(polygons: SportPolygon[]): void {
    localStorage.setItem(POLYGON_STORAGE_KEY, JSON.stringify(polygons));
  }

  public getPolygons(): SportPolygon[] {
    const stringifiedStorage = localStorage.getItem(POLYGON_STORAGE_KEY);
    if (!stringifiedStorage) { return [] as SportPolygon[]; }
    return JSON.parse(stringifiedStorage) as SportPolygon[];
  }

}
