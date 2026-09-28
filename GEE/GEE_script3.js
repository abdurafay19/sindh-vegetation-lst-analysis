// =========================================================
// LANDSAT LST TREND (Sindh)
// Early vs Recent ΔLST
//
// ΔLST = mean LST 2018–2024 (Landsat 8/9) − mean LST 2001–2005
//        (Landsat 5 + Landsat 7 before the SLC failure on 2003-05-31)
//
// KNOWN ARTEFACTS in the exported ΔLST (see main.ipynb §3.3):
// - ~500 m near-horizontal striping: scan/detector striping of the
//   whiskbroom TM/ETM+ thermal bands in the early composite. Not SLC-off
//   gaps — Landsat 7 is filtered to before 2003-05-01.
// - Diagonal bands with straight edges: WRS-2 path/scene boundaries.
//   mean() over all seasons gives each path a different seasonal mix.
// Possible fix for a future export: restrict both periods to the same
// months, use median() instead of mean(), or use MODIS MOD11A2 LST.
// =========================================================

var region = ee.FeatureCollection("projects/citric-yen-487317-c1/assets/sindh_province")
              .geometry();

// =========================================================
// CLOUD MASK
// =========================================================
function maskLandsat(img) {
  var qa = img.select("QA_PIXEL");
  var mask = qa.bitwiseAnd(1 << 3).eq(0)   // cloud
              .and(qa.bitwiseAnd(1 << 4).eq(0)); // shadow
  return img.updateMask(mask);
}

// =========================================================
// LST CONVERSION
// =========================================================
function lstL5L7(img) {
  return img.select("ST_B6")
    .multiply(0.00341802)
    .add(149.0)
    .subtract(273.15)
    .rename("lst");
}

function lstL8L9(img) {
  return img.select("ST_B10")
    .multiply(0.00341802)
    .add(149.0)
    .subtract(273.15)
    .rename("lst");
}

// =========================================================
// COLLECTIONS
// =========================================================
var L57 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(region)
  .filterDate("2001-01-01", "2005-12-31")
  .map(maskLandsat)
  .map(lstL5L7);

var L7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(region)
  .filterDate("2001-01-01", "2003-05-01")
  .map(maskLandsat)
  .map(lstL5L7);

var earlyLST = L57.merge(L7).mean().clip(region);

// =========================================================
// RECENT PERIOD
// =========================================================
var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(region)
  .filterDate("2018-01-01", "2024-12-31")
  .map(maskLandsat)
  .map(lstL8L9);

var L9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterBounds(region)
  .filterDate("2021-01-01", "2024-12-31")
  .map(maskLandsat)
  .map(lstL8L9);

var recentLST = L8.merge(L9).mean().clip(region);

// =========================================================
// ΔLST
// =========================================================
var deltaLST = recentLST.subtract(earlyLST)
  .rename("delta_lst");

// =========================================================
// EXPORT
// =========================================================
Export.image.toDrive({
  image: deltaLST,
  description: "Sindh_Landsat_DeltaLST",
  folder: "THESIS",
  fileNamePrefix: "delta_lst_landsat",
  region: region,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// =========================================================
// VISUALIZATION
// =========================================================
Map.centerObject(region, 7);

var vis = {
  min: -5,
  max: 5,
  palette: ["blue", "white", "red"]
};

Map.addLayer(deltaLST, vis, "ΔLST (Landsat)");