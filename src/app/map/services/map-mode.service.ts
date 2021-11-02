import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';


export type MapMode = 'marker'
| 'population-heatmap'
| 'sport-heatmap'
| 'polygon-draw'
| 'polygon-saving'
| 'object-intersection';

export type MapContent = 'object-info'
| 'analysis'
| 'polygon-saving'
| 'polygon-dashboard';

@Injectable()
export class MapModeService {

  constructor() {
  }

  // #region Content

  private readonly contentSubject =
  new BehaviorSubject<MapContent | undefined>(undefined);

  public readonly contentObservable = this.contentSubject.asObservable();

  public get content(): MapContent | undefined {
    return this.contentSubject.value;
  }

  public set content(value: MapContent | undefined) {
    this.contentSubject.next(value);
  }

  public clearContent(): void {
    this.content = undefined;
  }

  // #endregion


  // #region Mode

  private readonly modeSubject = new BehaviorSubject<MapMode[]>([]);

  public readonly modeObservable = this.modeSubject.asObservable();

  public get modes(): MapMode[] {
    return this.modeSubject.value;
  }

  public add(mode: MapMode): void {
    if (this.modeSubject.value.includes(mode)) { return; }

    this.onAdd(mode);

    const newModes = [ ...this.modeSubject.value ];
    newModes.push(mode);

    this.modeSubject.next(newModes);
  }

  public remove(mode: MapMode): void {
    this.onRemove(mode);

    const newModes = this.modeSubject.value.filter(
      existingMode => mode !== existingMode,
    );

    this.modeSubject.next(newModes);
  }

  private onAdd(mode: MapMode): void {
    if (mode === 'polygon-saving') {
      this.remove('marker');
      this.remove('polygon-draw');
      this.content = 'polygon-saving';
    } else if (mode === 'marker') {
      this.remove('polygon-saving');
      this.remove('polygon-draw');
    } else if (mode === 'polygon-draw') {
      this.remove('polygon-saving');
      this.remove('marker');
    }
  }

  private onRemove(mode: MapMode): void {
    if (mode === 'polygon-saving') {
      this.content = undefined;
    }
  }

  // #endregion

}
