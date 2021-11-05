export interface PolygonLayerSource {
  polygon: GeoJSON.FeatureCollection<GeoJSON.Polygon>;
  color: string;
  opacity: number;
}
