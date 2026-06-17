---
name: computational-architecture
description: "Computational and spatial design skill. Covers parametric layout generation, CAD schema design, GIS mapping, and geometric algorithms."
---

# /computational-architecture — Computational & Spatial Design

**Computational-Architecture** equips agents to handle GIS (Geographic Information System) spatial coordinates, CAD parametric schemas, and parametric architectural layout math.

---

## 📐 Computational Spatial Protocols

### 1. Spatial & GIS Operations
- **GeoJSON Processing**: Parse and manipulate spatial layouts, coordinates, bounding boxes, and polygons:
  ```json
  {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
    }
  }
  ```
- **Coordinate Conversion**: Convert between spatial projections (WGS84, UTM, and Web Mercator).
- **Proximity Math**: Implement kd-trees for nearest-neighbor coordinate clustering in urban layouts.

### 2. Parametric CAD Logic
- Define declarative CAD parameters for spatial generation.
- Implement constraint satisfaction solvers to align structures inside bounds.
- Auto-generate SVG layout representations for blueprints.
