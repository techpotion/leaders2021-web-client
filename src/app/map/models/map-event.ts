export interface MapEvent {
  event: MapEventLiteral;
}

type MapEventLiteral = 'clear-polygon'
| 'fit-polygon'
| 'undefined';
