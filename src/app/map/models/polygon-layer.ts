export interface PolygonLayerSource {
  polygon: GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>;
  color: string;
  opacity: number;
}
