export interface MarkerLayer {
  data: GeoJSON.FeatureCollection<GeoJSON.Point, { id: number | string }>;
  image: {
    source: string;
    anchor: mapboxgl.Anchor;
  };
  className: string;
  cluster: {
    background: string;
    color: string;
  };
}
