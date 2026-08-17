# Sindh Forest Degradation & LST Trend Analysis

A reproducible geospatial study investigating vegetation degradation, land-cover change, land surface temperature dynamics, and infrastructure pressure across **Sindh, Pakistan**, from **2001–2024**.

---

## 🌍 Project Background

Earlier this year, while taking a Spatial Data Science course, I came across an Eos article in *Dawn* titled **"The Lost Forests of Sindh."**

The article discussed how decades of deforestation, expanding infrastructure, and weak forest protection have contributed to shrinking riverine forests, rising land surface temperatures, and wider ecological degradation across Sindh.

Rather than simply accepting these claims, I wanted to investigate:

> **Can publicly available Earth observation data be used to independently examine these environmental changes across Sindh?**

This project was the result.

Over the course of the project, I built a reproducible geospatial workflow using **Google Earth Engine, Python, and QGIS**, analyzing approximately **24 years of satellite-derived data from 2001–2024**.

Rather than attempting to prove or disprove a single claim, the analysis focuses on several measurable questions about vegetation, temperature, land-cover change, and human infrastructure.

---

# 🔬 Research Questions

The analysis focuses on five main questions:

1. 🌱 **Is vegetation declining across Sindh?**
2. 🌡️ **Is land surface temperature increasing?**
3. 🌿 **What is the relationship between vegetation and surface temperature?**
4. 🛰️ **How is land cover changing over time?**
5. 🛣️ **Is landscape degradation spatially associated with infrastructure?**

---

# 📊 Key Results

## 🌱 1. Vegetation Change — NDVI Sen's Slope

![NDVI Sen's Slope](outputs/ndvi_sens_slope.png)

To investigate long-term vegetation change, I analyzed a multi-year **NDVI time series** and calculated **Sen's Slope** for each pixel.

The resulting map identifies areas experiencing persistent vegetation decline as well as areas showing localized vegetation recovery.

### Interpretation

- **Negative Sen's slope** → declining vegetation trend
- **Positive Sen's slope** → increasing vegetation trend
- Values close to zero → relatively stable vegetation

This provides a spatial representation of where vegetation conditions have changed most consistently during the study period.

---

## 🌡️ 2. Land Surface Temperature Change

![Land Surface Temperature Change](outputs/delta_lst_landsat.png)

I analyzed changes in **Land Surface Temperature (LST)** to investigate whether the land surface has become warmer or cooler over the study period.

The resulting ΔLST map shows substantial warming across large portions of Sindh, with particularly noticeable patterns in parts of **northern and southeastern Sindh**.

### Interpretation

The analysis classifies areas into:

- 🔵 **Cooling**
- ⚪ **Stable**
- 🔴 **Warming**

> **Note:** LST represents the temperature of the land surface derived from satellite observations. It should not be interpreted as equivalent to near-surface air temperature.

---

## 🌿 3. Vegetation vs. Surface Temperature

![NDVI-LST Correlation](outputs/ndvi_lst_correlation.png)

To investigate the relationship between vegetation and surface temperature, I performed a **pixel-wise NDVI–LST correlation analysis**.

The analysis reveals a predominantly **negative relationship** between vegetation and land surface temperature across much of Sindh.

In general:

> Areas with higher vegetation conditions tend to correspond to lower surface temperatures, while areas with lower vegetation tend to exhibit higher surface temperatures.

This pattern is consistent with vegetation's role in moderating surface heat.

However, the correlation represents an **association rather than proof of causation**. Other environmental and land-use factors can also influence surface temperature.

---

## 🛰️ 4. Land-Cover Transitions

![Land Cover Transitions](outputs/lc_transition.png)

To understand *how* the landscape changed, rather than only measuring vegetation trends, I analyzed **land-cover transitions**.

The transition raster was decoded into categories representing changes such as:

- Stable land cover
- Vegetation → urban
- Vegetation loss
- Vegetation gain
- Other land-cover transitions

The results show widespread transformation of natural vegetation into **cropland**, while some ecologically sensitive areas experienced concentrated vegetation loss.

This analysis provides additional context for interpreting the NDVI trends.

---

## 🛣️ 5. Infrastructure Pressure

![Road Proximity Analysis](outputs/road_degradation.png)

Finally, I investigated whether land-cover degradation was spatially associated with transportation infrastructure.

Major roads were converted into a raster representation and **Euclidean distance from roads** was calculated.

Degradation rates were then analyzed across different road-distance bands.

Approximately **14% of identified land-cover degradation occurred within the first kilometer of roads**, with degradation decreasing substantially beyond approximately **5 km**.

### Interpretation

The observed spatial pattern suggests an association between transportation infrastructure and landscape transformation.

However, this should **not** be interpreted as evidence that roads directly caused degradation.

Road proximity may also act as a proxy for:

- accessibility
- settlements
- agricultural expansion
- development
- other human activities

---

# 🧩 Ecological Stress Hotspots

The project also combines vegetation and temperature information to identify areas where **vegetation decline coincides with increasing surface temperature**.

These areas can be interpreted as potential **ecological stress hotspots**, where multiple indicators of environmental change occur together.

![Ecological Stress Hotspots](outputs/ecological_stress_hotspots.png)

The purpose of this layer is not to establish causality, but to provide a spatial screening mechanism for identifying regions that may warrant further investigation.

---

# 🗺️ District-Level Vulnerability

In addition to pixel-level analysis, the project aggregates environmental indicators at the **district level** to construct a composite vulnerability index.

The index combines multiple indicators of environmental stress to identify districts experiencing relatively greater levels of observed degradation and warming.

![District Vulnerability](outputs/district_vulnerability.png)

This provides a more decision-oriented view of the analysis, allowing environmental patterns to be compared across administrative boundaries.

---

# 🔄 Analytical Workflow

The overall workflow combines Google Earth Engine, Python, and GIS analysis.

```text
                 ┌─────────────────────┐
                 │ Earth Observation   │
                 │       Data          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Google Earth Engine │
                 │   Data Processing   │
                 └──────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
            NDVI           LST        Land Cover
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Python Geospatial   │
                 │      Analysis       │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     Trend Analysis    Correlation       Transitions
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Infrastructure &    │
                 │ District Analysis   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Maps, Statistics &  │
                 │ Vulnerability Index │
                 └─────────────────────┘
````

---

# 🧪 Methodology

## 1. Study Area

The analysis covers **Sindh Province, Pakistan**, using district boundaries and river networks as supporting spatial layers.

All spatial datasets are reprojected and aligned as required for consistent raster and vector analysis.

---

## 2. Vegetation Trend Analysis

The vegetation analysis uses NDVI and **Sen's Slope** to estimate long-term pixel-wise vegetation trends.

Input:

```text
ndvi_sens_slope.tif
```

Output:

* vegetation greening
* vegetation browning
* spatial distribution of long-term vegetation trends

---

## 3. Land-Cover Transition Analysis

The project uses a land-cover transition raster:

```text
lc_transition.tif
```

Encoded transition values are decoded into interpretable categories such as:

* stable land cover
* vegetation loss
* vegetation gain
* vegetation → urban
* other transitions

This allows land-cover change to be analyzed spatially rather than relying solely on vegetation indices.

---

## 4. Land Surface Temperature

The project analyzes changes in land surface temperature using:

```text
delta_lst_landsat.tif
```

Pixels are classified into:

* cooling
* stable
* warming

The resulting ΔLST layer is used both independently and alongside vegetation trends.

---

## 5. NDVI–LST Correlation

A pixel-level correlation analysis is used to examine the relationship between vegetation and surface temperature.

The resulting raster highlights areas where the relationship between NDVI and LST is stronger or weaker.

---

## 6. Infrastructure Proximity

Major roads are rasterized and Euclidean distance is calculated from the road network.

Degradation is then compared across distance bands to investigate whether degradation is spatially concentrated near infrastructure.

---

# 📁 Repository Structure

```text
.
├── main.ipynb
│
├── GEE_script1.js
├── GEE_script2.js
├── GEE_script3.js
├── GEE_script4.js
│
├── data/
│   ├── district boundaries
│   ├── road network
│   └── river network
│
├── outputs/
│   ├── NDVI trend maps
│   ├── LST maps
│   ├── land-cover transition maps
│   ├── correlation maps
│   └── vulnerability outputs
│
└── README.md
```

---

# 🚀 How to Run

## 1. Clone the repository

```bash
git clone https://github.com/abdurafay19/sindh-vegetation-lst-analysis.git
cd sindh-vegetation-lst-analysis
```

## 2. Set up the Python environment

The notebook requires a Python geospatial environment containing packages such as:

```text
numpy
pandas
geopandas
rasterio
rioxarray
xarray
rasterstats
shapely
scipy
mapclassify
matplotlib
seaborn
```

## 3. Open the notebook

```bash
jupyter notebook main.ipynb
```

or open the project using JupyterLab.

## 4. Configure paths

Set `DATA_PATH` and `OUTPUT_PATH` in the setup section of the notebook if necessary.

## 5. Run the notebook

Execute the cells from top to bottom.

The notebook performs the data loading, raster processing, classification, spatial analysis, mapping, and vulnerability calculations.

---

# 🛰️ Google Earth Engine

The repository also contains the Google Earth Engine scripts used to prepare and export raster layers for the Python analysis:

```text
GEE_script1.js
GEE_script2.js
GEE_script3.js
GEE_script4.js
```

These scripts can be used to reproduce or refresh the Earth Engine-derived datasets used by the project.

---

# 🛠️ Technologies

### Geospatial & Remote Sensing

* Google Earth Engine
* QGIS
* GeoPandas
* Rasterio
* Rioxarray
* Xarray
* Rasterstats
* Shapely

### Data Science

* Python
* NumPy
* Pandas
* SciPy
* Matplotlib
* Seaborn

### Earth Observation

* NDVI
* Land Surface Temperature
* Land-cover data
* Multi-temporal satellite imagery
* OpenStreetMap road data

---

# 📌 Key Findings

The analysis identified several notable spatial patterns:

* 🌱 Persistent vegetation degradation occurs across parts of Sindh alongside areas of localized recovery.
* 🌡️ Land surface temperature increased across substantial portions of the province.
* 🌿 NDVI and LST show a predominantly negative spatial relationship.
* 🛰️ Land-cover analysis indicates widespread conversion of natural vegetation into cropland.
* 🛣️ Approximately **14% of identified degradation occurred within 1 km of roads**, with degradation decreasing substantially beyond approximately 5 km.
* ⚠️ Several areas show overlapping signals of vegetation decline and surface warming, providing potential ecological stress hotspots.

These findings describe patterns observed in the available datasets and should not be interpreted as definitive causal explanations.

---

# ⚠️ Limitations

This project is an exploratory spatial analysis rather than a definitive assessment of the causes of forest degradation.

Important limitations include:

* Satellite-derived LST represents land surface temperature rather than air temperature.
* Correlation between NDVI and LST does not establish causation.
* Road proximity is an indicator of spatial association and may also represent accessibility and other forms of human activity.
* Land-cover classification and transition results depend on the quality and resolution of the underlying datasets.
* Pixel alignment is important when combining the different raster layers.
* The analysis identifies spatial and temporal patterns but does not independently establish the causal mechanisms behind them.

---

# 🎓 What I Learned

This project was primarily an exercise in applying **Spatial Data Science to a real-world environmental question**.

Through the project I worked with:

* multi-temporal satellite data
* Google Earth Engine
* raster and vector geospatial data
* spatial statistics
* NDVI trend analysis
* Land Surface Temperature
* land-cover transitions
* distance-based spatial analysis
* district-level aggregation
* reproducible Python workflows
* GIS visualization

More importantly, it taught me how to move from a broad real-world question to a set of **measurable spatial hypotheses**, and then investigate them using openly available Earth observation data.

---

# 📚 Motivation

The project was inspired by the *Dawn/Eos* article:

> **"The Lost Forests of Sindh"**

The goal was not to prove the article right or wrong, but to explore whether publicly available Earth observation data could be used to independently investigate some of the environmental patterns discussed in it.

