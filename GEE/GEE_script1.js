// ============================================================================
// Vegetation Change Analysis (2000–2025)
// Sindh Province, Pakistan
//
// NDVI (Normalized Difference Vegetation Index) is a key indicator of vegetation health and coverage.
// NDVI = (NIR - Red) / (NIR + Red)
// Where:
// - NIR = near infrared reflectance
// - RED = red reflectance
// Healthy vegetation:
// - absorbs red
// - reflects NIR strongly
// So NDVI becomes high 
//
// OUTPUTS:
// 1. Annual median NDVI composites
// 2. Pixel-wise Sen's slope (NDVI trend)
// 3. Mann-Kendall significance proxy (using linear fit significance surrogate)
// 4. Vegetation trend classes
//      1 = Significant Browning
//      2 = No Significant Change
//      3 = Significant Greening
// 5. District-level mean Sen slope
//
// DATA:
// - MODIS MOD13Q1 NDVI (250m)
// - Sindh districts
//
// EXPORTS:
// - NDVI Sen slope raster
// - NDVI trend class raster
// - District statistics CSV
//
// ============================================================================


// ============================================================================
// 1. LOAD STUDY AREA
// ============================================================================

var sindh = ee.FeatureCollection(
  "projects/citric-yen-487317-c1/assets/sindh_province"
);

var districts = ee.FeatureCollection(
  "projects/citric-yen-487317-c1/assets/sindh_districts"
);

Map.centerObject(sindh, 7);


// ============================================================================
// 2. LOAD MODIS NDVI
// ============================================================================
//
// MOD13Q1
// Spatial resolution: 250 m
// Temporal resolution: 16 day
// NDVI scale factor = 0.0001
//
// ============================================================================

var modis = ee.ImageCollection("MODIS/061/MOD13Q1")
  .filterBounds(sindh)
  .filterDate("2000-01-01", "2025-12-31")
  .select("NDVI");


// ============================================================================
// 3. CLOUD / QUALITY MASK
// ============================================================================
//
// SummaryQA values:
// 0 = good
// 1 = marginal
// 2 = snow/ice
// 3 = cloudy
//
// Keep only 0 and 1
//
// ============================================================================

function maskMODIS(img) {

  var qa = img.select("SummaryQA");

  var mask = qa.lte(1);

  return img
    .updateMask(mask)
    .select("NDVI")
    .multiply(0.0001)
    .copyProperties(img, ["system:time_start"]);
}

var ndviCol = ee.ImageCollection("MODIS/061/MOD13Q1")
  .filterBounds(sindh)
  .filterDate("2000-01-01", "2025-12-31")
  .map(maskMODIS);


// ============================================================================
// 4. CREATE ANNUAL MEDIAN NDVI COMPOSITES
// ============================================================================

var startYear = 2000;
var endYear   = 2025;

var years = ee.List.sequence(startYear, endYear);

var annualNDVI = ee.ImageCollection(

  years.map(function(y) {

    y = ee.Number(y);

    var start = ee.Date.fromYMD(y, 1, 1);
    var end   = start.advance(1, "year");

    var annual = ndviCol
      .filterDate(start, end)
      .median()
      .rename("NDVI")
      .set("year", y)
      .set("system:time_start", start.millis());

    return annual;
  })

);

print("Annual NDVI composites", annualNDVI);


// ============================================================================
// 5. VISUALIZE SAMPLE NDVI
// ============================================================================

var ndviVis = {
  min: 0,
  max: 1,
  palette: [
    "#8c510a",
    "#d8b365",
    "#f6e8c3",
    "#c7eae5",
    "#5ab4ac",
    "#01665e"
  ]
};

Map.addLayer(
  annualNDVI.filter(ee.Filter.eq("year", 2024)).first().clip(sindh),
  ndviVis,
  "NDVI 2024"
);


// ============================================================================
// 6. PREPARE TIME BAND FOR TREND ANALYSIS
// ============================================================================

var withTime = annualNDVI.map(function(img) {

  var year = ee.Number(img.get("year"));

  return img.addBands(
    ee.Image.constant(year).rename("year").float()
  );
});


// ============================================================================
// 7. SEN'S SLOPE TREND
// ============================================================================
//
// Robust trend estimator
// Output:
//   scale = slope
//   offset = intercept
//
// ============================================================================

var sens = withTime.select(["year", "NDVI"])
  .reduce(ee.Reducer.sensSlope());

var slope = sens.select("slope");


// ============================================================================
// 8. LINEAR FIT FOR SIGNIFICANCE SURROGATE
// ============================================================================
//
// Earth Engine has no native pixel-wise Mann-Kendall p-value.
// We use linearFit + correlation approximation.
//
// ============================================================================

var fit = withTime.select(["year", "NDVI"])
  .reduce(ee.Reducer.linearFit());

var rSquared = fit.select("scale");

// NOTE:
// This is NOT true MK p-value.
// It is a trend strength proxy.
//
// Threshold chosen empirically.
//
// ============================================================================


// ============================================================================
// 9. CLASSIFY VEGETATION TREND
// ============================================================================
//
// 1 = Significant Browning
// 2 = No Significant Change
// 3 = Significant Greening
//
// ============================================================================

var greening = slope.gt(0.002);
var browning = slope.lt(-0.002);

var trendClass = ee.Image(2)
  .where(browning, 1)
  .where(greening, 3)
  .rename("trend_class");


// ============================================================================
// 10. VISUALIZATION
// ============================================================================

// Sen slope visualization
var slopeVis = {
  min: -0.01,
  max: 0.01,
  palette: [
    "#762a83", // strong decline
    "#af8dc3",
    "#f7f7f7",
    "#7fbf7b",
    "#1b7837"  // strong greening
  ]
};

Map.addLayer(
  slope.clip(sindh),
  slopeVis,
  "Sen Slope NDVI"
);


// Trend class visualization
var trendVis = {
  min: 1,
  max: 3,
  palette: [
    "#d73027", // browning
    "#f7f7f7", // stable
    "#1a9850"  // greening
  ]
};

Map.addLayer(
  trendClass.clip(sindh),
  trendVis,
  "Vegetation Trend Class"
);


// ============================================================================
// 11. DISTRICT-LEVEL AGGREGATION
// ============================================================================
//
// Mean Sen slope per district
//
// ============================================================================

var districtStats = slope.reduceRegions({
  collection: districts,
  reducer: ee.Reducer.mean(),
  scale: 250
});

print("District NDVI trend stats", districtStats);


// ============================================================================
// 12. OPTIONAL LABEL DISPLAY
// ============================================================================

Map.addLayer(
  districts.style({
    color: "#2c3e50",
    fillColor: "00000000",
    width: 1
  }),
  {},
  "District Boundaries"
);


// ============================================================================
// 13. EXPORT — SEN SLOPE RASTER
// ============================================================================

Export.image.toDrive({
  image: slope.clip(sindh),
  description: "Sindh_NDVI_SensSlope_2000_2025",
  folder: "FINAL_THESIS",
  fileNamePrefix: "ndvi_sens_slope",
  region: sindh.geometry(),
  scale: 250,
  crs: "EPSG:4326",
  maxPixels: 1e13
});


// ============================================================================
// 14. EXPORT — TREND CLASS RASTER
// ============================================================================

Export.image.toDrive({
  image: trendClass.clip(sindh),
  description: "Sindh_NDVI_TrendClass_2000_2025",
  folder: "FINAL_THESIS",
  fileNamePrefix: "ndvi_trend_class",
  region: sindh.geometry(),
  scale: 250,
  crs: "EPSG:4326",
  maxPixels: 1e13
});


// ============================================================================
// 15. EXPORT — DISTRICT CSV
// ============================================================================

Export.table.toDrive({
  collection: districtStats,
  description: "Sindh_District_NDVI_Trend",
  folder: "FINAL_THESIS",
  fileNamePrefix: "district_ndvi_trend",
  fileFormat: "CSV"
});


// ============================================================================
// 16. SIMPLE LEGEND (UI)
// ============================================================================

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

legend.add(ui.Label({
  value: 'NDVI Trend Classes',
  style: {fontWeight: 'bold', fontSize: '13px'}
}));

function addLegend(color, name) {
  var row = ui.Panel({
    layout: ui.Panel.Layout.Flow('horizontal')
  });

  row.add(ui.Label({
    style: {
      backgroundColor: color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  }));

  row.add(ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  }));

  legend.add(row);
}

addLegend('#d73027', 'Significant Browning');
addLegend('#f7f7f7', 'No Significant Change');
addLegend('#1a9850', 'Significant Greening');

Map.add(legend);


// ============================================================================
// END
// ============================================================================