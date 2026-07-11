/**************************
 NDVI–LST CORRELATION 
 2000–2025 monthly aligned 
***************************/

var region = ee.FeatureCollection(
  "projects/citric-yen-487317-c1/assets/sindh_province"
).geometry();

// ----------------------
// NDVI
// ----------------------
var ndvi = ee.ImageCollection("MODIS/061/MOD13A2")
  .select("NDVI")
  .filterBounds(region)
  .map(function(img){
    return img.multiply(0.0001)
      .copyProperties(img, ["system:time_start"]);
  });

// ----------------------
// LST
// ----------------------
var lst = ee.ImageCollection("MODIS/061/MOD11A2")
  .select("LST_Day_1km")
  .filterBounds(region)
  .map(function(img){
    return img.multiply(0.02)
      .subtract(273.15)
      .copyProperties(img, ["system:time_start"]);
  });

// ----------------------
// MONTHLY ALIGNMENT
// ----------------------
var months = ee.List.sequence(0, (2025 - 2000 + 1) * 12 - 1);

var monthly = ee.ImageCollection.fromImages(
  months.map(function(i) {

    i = ee.Number(i);

    var start = ee.Date('2000-01-01').advance(i, 'month');
    var end   = start.advance(1, 'month');

    var nd = ndvi.filterDate(start, end).mean();
    var lt = lst.filterDate(start, end).mean();

    var ndValid = nd.bandNames().size().gt(0);
    var ltValid = lt.bandNames().size().gt(0);

    return ee.Image(ee.Algorithms.If(
      ndValid.and(ltValid),
      nd.addBands(lt).set('system:time_start', start.millis()),
      null
    ));

  })
).filter(ee.Filter.notNull(['system:time_start']));

// ----------------------
// CORRELATION
// ----------------------
var corr = monthly.reduce(
  ee.Reducer.pearsonsCorrelation()
);

// ----------------------
// OUTPUT MAP
// ----------------------
var result = corr.select("correlation").clip(region);

Map.centerObject(region, 7);

Map.addLayer(result, {
  min: -1,
  max: 1,
  palette: ["08306b", "f7f7f7", "67000d"]
}, "NDVI–LST Correlation");

// ----------------------
// EXPORT
// ----------------------
Export.image.toDrive({
  image: result,
  description: "Sindh_NDVI_LST_Correlation",
  folder: "GEE_Correlation",
  fileNamePrefix: "Sindh_NDVI_LST_corr",
  region: region,
  scale: 1000,
  maxPixels: 1e13
});