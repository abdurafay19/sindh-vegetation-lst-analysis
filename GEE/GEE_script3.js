// =========================================================
// LANDSAT LST TREND (Sindh)
// Early vs Recent ΔLST
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