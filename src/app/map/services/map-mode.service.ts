import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export type MapMode = 'marker'
| 'population-heatmap'
| 'sport-heatmap'
| 'polygon-draw'
| 'quick-analytics'
| 'polygon-saving'
| 'object-intersection';

export type MapContent = 'object-info'
| 'analysis'
| 'polygon-saving'
| 'quick-analytics'
| 'polygon-dashboard';

@Injectable()
export class MapModeService {

  constructor() {
  }

  // #region Content

  private readonly contentSubject = new BehaviorSubject<MapContent[]>([]);

  public readonly contentObservable = this.contentSubject.asObservable();

  public get content(): MapContent[] {
    return this.contentSubject.value;
  }

  public addContent(content: MapContent): void {
    if (this.contentSubject.value.includes(content)) { return; }

    this.onAddContent(content);

    const newContent = [ ...this.contentSubject.value ];
    newContent.push(content);

    this.contentSubject.next(newContent);
  }

  public removeContent(content: MapContent): void {
    const newContent = this.contentSubject.value.filter(
      existingContent => content !== existingContent,
    );

    this.contentSubject.next(newContent);
  }

  public hasContent(content: MapContent): Observable<boolean> {
    return this.contentObservable.pipe(
      map(existingContent => existingContent.includes(content)),
    );
  }

  public clearContent(): void {
    this.contentSubject.next([]);
  }

  private onAddContent(content: MapContent): void {
    if (content === 'object-info') {
      this.clearContent();
    } else if (content === 'polygon-saving') {
      this.clearContent();
    } else if (content === 'polygon-dashboard') {
      this.removeContent('object-info');
    } else if (content === 'quick-analytics') {
      this.clearContent();
    }
  }

  // #endregion


  // #region Mode

  private readonly modeSubject = new BehaviorSubject<MapMode[]>([]);

  public readonly modeObservable = this.modeSubject.asObservable();

  public get modes(): MapMode[] {
    return this.modeSubject.value;
  }

  public hasMode(mode: MapMode): Observable<boolean> {
    return this.modeObservable.pipe(
      map(existingModes => existingModes.includes(mode)),
    );
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
      this.remove('quick-analytics');
      this.addContent('polygon-saving');
    } else if (mode === 'marker') {
      this.remove('polygon-saving');
      this.remove('polygon-draw');
      this.remove('quick-analytics');
    } else if (mode === 'polygon-draw') {
      this.remove('polygon-saving');
      this.remove('marker');
      this.remove('quick-analytics');
    } else if (mode === 'quick-analytics') {
      this.remove('polygon-saving');
      this.remove('polygon-draw');
      this.remove('marker');
      this.addContent('quick-analytics');
    }
  }

  private onRemove(mode: MapMode): void {
    if (mode === 'polygon-saving') {
      this.removeContent('polygon-saving');
    } else if (mode === 'quick-analytics') {
      this.removeContent('quick-analytics');
    }
  }

  // #endregion

}
