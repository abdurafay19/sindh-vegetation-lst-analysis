# Sindh Forest Degradation & LST Trend Analysis

This repository contains a geospatial study of forest degradation, land cover change, and surface temperature dynamics across Sindh Province, Pakistan, for the period 2001–2024.

## Project overview

The analysis integrates multi-temporal remote sensing and vector data to identify spatial patterns of:
- vegetation change using NDVI Sen's slope
- land cover transitions and degradation
- Land Surface Temperature (ΔLST) change
- ecological stress hotspots where vegetation loss coincides with warming
- infrastructure pressure through distance-to-roads analysis
- district-level vulnerability using a composite index

## Key files

- `main.ipynb`
  - primary notebook containing the full workflow
  - includes data loading, raster decoding, classification, mapping, zonal statistics, and vulnerability scoring

- `data/`
  - input geospatial files used by the notebook
  - includes district boundaries, road network, river network

- `outputs/`
  - generated figures and maps exported from the notebook

- `GEE_script1.js`, `GEE_script2.js`, `GEE_script3.js`, `GEE_script4.js`
  - Google Earth Engine scripts for preparing and exporting raster layers used in the analysis

## Analytical workflow

1. **Study area setup**
   - Load Sindh district boundaries and river network
   - Reproject all spatial layers to a common CRS for consistent mapping and analysis

2. **Vegetation trend analysis**
   - Load `ndvi_sens_slope.tif`
   - Map greening vs browning based on pixel-wise NDVI Sen's slope

3. **Land cover transition decoding**
   - Load `lc_transition.tif`
   - Decode encoded values into transition classes such as stable, vegetation → urban, vegetation loss, and vegetation gain

4. **Land Surface Temperature change**
   - Load `delta_lst_landsat.tif`
   - Classify pixels into cooling, stable, and warming categories

5. **Pixel-level correlation**
   - Load NDVI–LST correlation raster exported from Google Earth Engine
   - Display statistically significant pixel correlation patterns

6. **Infrastructure proximity analysis**
   - Rasterize major roads
   - Compute Euclidean distance from roads at raster resolution
   - Analyze degradation rates across distance bands

## How to run

1. Open `main.ipynb` in Jupyter or JupyterLab.
2. Set `DATA_PATH` and `OUTPUT_PATH` in the first setup cell if needed.
3. Run cells in order from top to bottom.
4. Verify that the `data/` folder contains the expected raster and vector inputs.
5. Inspect exported outputs in the `outputs/` folder.

## Requirements

This notebook is designed for a Python geospatial environment featuring packages such as:
- `numpy`
- `pandas`
- `geopandas`
- `rasterio`
- `rioxarray`
- `xarray`
- `rasterstats`
- `shapely`
- `scipy`
- `mapclassify`
- `matplotlib`
- `seaborn`

## Notes

- The notebook assumes raster pixel alignment when combining NDVI, LST, and transition layers.
- `GEE_script*.js` files are provided to reproduce or refresh Earth Engine exports used in the analysis.

