/* eslint-disable @typescript-eslint/no-magic-numbers */
// Polygon

export const polygonFill = {
  id: 'gl-draw-polygon-fill',
  type: 'fill',
  filter: [
    'all',
    ['==', '$type', 'Polygon'],
  ],
  paint: {
    'fill-color': '#DAE0EF',
    'fill-outline-color': '#DAE0EF',
    'fill-opacity': 0.6,
  },
};


// Polygon stroke

const strokeLayout = {
  'line-cap': 'butt',
  'line-join': 'miter',
};

const strokePaint = {
  'line-color': '#6C82C1',
  'line-dasharray': [5, 5],
  'line-width': 2,
};

export const polygonStroke = {
  id: 'gl-draw-polygon-stroke-active',
  type: 'line',
  filter: [
    'all',
    ['==', '$type', 'Polygon'],
    ['==', 'active', 'true'],
  ],
  layout: strokeLayout,
  paint: strokePaint,
};

export const drawLine = {
  id: 'gl-draw-line-active',
  type: 'line',
  filter: [
    'all',
    ['==', '$type', 'LineString'],
    ['==', 'active', 'true'],
  ],
  layout: strokeLayout,
  paint: strokePaint,
};


// Points

export const midPoint = {
  id: 'gl-draw-polygon-midpoint',
  type: 'circle',
  filter: [
    'all',
    ['==', '$type', 'Point'],
    ['==', 'meta', 'midpoint'],
  ],
  paint: {
    'circle-radius': 4,
    'circle-color': '#193C9D',
  },
};

const vertexPointPaint = {
  'circle-radius': 4,
  'circle-color': '#FFFFFF',
};

const vertexPointStrokePaint = {
  'circle-radius': 7,
  'circle-color': '#193C9D',
};

export const vertexPointStroke = {
  id: 'gl-draw-point-stroke-active',
  type: 'circle',
  filter: [
    'all',
    ['==', '$type', 'Point'],
    ['!=', 'meta', 'midpoint'],
  ],
  paint: vertexPointStrokePaint,
};

export const vertexPoint = {
  id: 'gl-draw-point-active',
  type: 'circle',
  filter: [
    'all',
    ['==', '$type', 'Point'],
    ['!=', 'meta', 'midpoint'],
  ],
  paint: vertexPointPaint,
};

export const drawVertexPointStroke = {
  id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
  type: 'circle',
  filter: [
    'all',
    ['==', '$type', 'Point'],
    ['==', 'meta', 'vertex'],
    ['!=', 'mode', 'static'],
  ],
  paint: vertexPointStrokePaint,
};

export const drawVertexPoint = {
  id: 'gl-draw-polygon-and-line-vertex-inactive',
  type: 'circle',
  filter: [
    'all',
    ['==', '$type', 'Point'],
    ['==', 'meta', 'vertex'],
    ['!=', 'mode', 'static'],
  ],
  paint: vertexPointPaint,
};
