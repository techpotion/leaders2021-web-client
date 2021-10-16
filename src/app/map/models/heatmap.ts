export interface Heatmap {
  data: GeoJSON.FeatureCollection;
  property?: string;
  maxzoom?: number;
  radiusStops: HeatmapRadiusStop[];
}

interface HeatmapRadiusStop {
  zoom: number;
  radius: number;
}
