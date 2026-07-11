// =========================================================
// LANDCOVER TRANSITION (2001 → 2024)
// MODIS MCD12Q1
// =========================================================

// STUDY AREA (replace if needed)
var region = ee.FeatureCollection("projects/citric-yen-487317-c1/assets/sindh_province")
  .geometry();

// =========================================================
// LOAD MODIS LANDCOVER
// =========================================================
var lc = ee.ImageCollection("MODIS/061/MCD12Q1")
  .select("LC_Type1");

// =========================================================
// SIMPLE RECLASS (MODIS → simplified classes)
// =========================================================
// 1-3   = vegetation
// 4     = cropland
// 5     = urban
// 6     = barren
// 7     = water

function reclass(img) {
  return img.remap(
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
    [1,1,1,4,5,6,7,1,1,1,1,4,5,4,6,6,7]
  ).rename("lc");
}

// =========================================================
// SELECT YEARS
// =========================================================
var lc2001 = reclass(
  lc.filterDate("2001-01-01", "2001-12-31").first()
);

var lc2024 = reclass(
  lc.filterDate("2024-01-01", "2024-12-31").first()
);

// =========================================================
// TRANSITION CODE
// from_class * 10 + to_class
// =========================================================
var transition = lc2001.multiply(10).add(lc2024)
  .rename("transition")
  .toInt16()
  .clip(region);

// =========================================================
// VISUAL CHECK
// =========================================================
Map.centerObject(region, 7);

Map.addLayer(lc2001.clip(region), {}, "LC 2001");
Map.addLayer(lc2024.clip(region), {}, "LC 2024");

// palette for transitions
var vis = {
  min: 11,
  max: 77,
  palette: [
    "#2ecc71", "#27ae60", "#f1c40f",
    "#e67e22", "#e74c3c", "#95a5a6", "#3498db"
  ]
};

Map.addLayer(transition, vis, "Transition Map");

// =========================================================
// EXPORT
// =========================================================
Export.image.toDrive({
  image: transition,
  description: "LC_Transition_2001_2024",
  folder: "FINAL_THESIS",
  fileNamePrefix: "lc_transition",
  region: region,
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});