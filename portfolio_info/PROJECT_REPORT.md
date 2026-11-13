# Project Report: Dynamic Pricing Model

---

## 1. Overview

This project builds a **Dynamic Pricing Model** for a fictional retail chain spanning multiple stores, departments, and regions. It integrates data engineering, exploratory data analysis, machine learning, statistical testing, and time-series forecasting to derive data-driven pricing strategies.

The primary objective is to predict future weekly sales and recommend optimal price adjustments based on seasonal patterns, economic indicators, and store-level characteristics.

---

## 2. Data Sources

Three web-scraped CSV datasets were joined into a unified dataframe:

| Dataset | Rows | Columns | Description |
|---|---|---|---|
| `stores data-set.csv` | 45 | `Store`, `Type`, `Size` | Anonymized information about 45 stores (store type A/B and floor area in sq ft) |
| `Features data set.csv` | 8,190 | 11 | External macroeconomic and weather features: `Temperature`, `Fuel_Price`, `MarkDown1–5`, `CPI`, `Unemployment`, `IsHoliday` |
| `sales data-set.csv` | 421,570 | 5 | Weekly sales records (`Store`, `Dept`, `Date`, `Weekly_Sales`, `IsHoliday`) |

**Date range:** 2010-02-05 to 2012-11-01

---

## 3. Tools & Technologies

- **Python** — web scraping, data cleaning, EDA, statistical analysis, machine learning, and predictive modelling
- **Databricks (PySpark)** — ETL pipeline and SQL-based data wrangling
- **SQL** — analytical queries (percentiles, window functions, correlation analysis, CTEs)
- **Tableau** — interactive dashboards, calculated fields, and rolling calculations
- **K-Means Clustering** — customer segmentation (RFM-style: revenue, frequency, recency)
- **ANOVA + Tukey's HSD** — statistical significance testing across months
- **Time Series Analysis & Forecasting** — basis for the dynamic pricing model

---

## 4. ETL Pipeline (Databricks)

An ETL pipeline was implemented in Databricks using Apache Spark (PySpark) to ingest, transform, and load the retail datasets. Key SQL transformations include:

- **Deriving daily metrics:** `DailySales = ROUND(WeeklySales / 7, 2)` and `DailyDiscount`
- **Classifying discount levels** via percentile-based thresholds:
  - No Discount (0)
  - Low Discount ($114.87 – $332.58)
  - Discount ($332.58 – $592.89)
  - High Discount ($592.89 – $2,014.95)
  - Max Discount (>$2,014.95)
- **Correlation analysis** between economic/feature variables and daily sales (Temperature, Fuel Price, Daily Discount, Unemployment, CPI, Store Size)
- **Percentile-based outlier detection** (90th percentile sales identification per date using CTEs and window functions)
- **Top-performing dates and months** by store size category

The transformed dataset is stored as `workspace.default.df_ready`.

---

## 5. Methodology & Techniques

### 5.1 Exploratory Data Analysis (EDA)
- Line graphs for sales trends over time
- Pairplots (scatterplot matrices) for numerical feature relationships
- Boxplots and bar graphs with trendlines for categorical comparisons
- Violin plots for cluster distribution visualisation

### 5.2 K-Means Clustering
An unsupervised learning model segments stores/customers based on:
- **Revenue generated**
- **Frequency of purchases**
- **Recency**

Three clusters were identified and visualised via 3D scatter plots and violin plots.

### 5.3 Statistical Testing
- **ANOVA** conducted to test whether average weekly sales differ significantly across months of the year
- **Tukey's HSD** post-hoc test performed for pairwise month comparisons when ANOVA significance was confirmed

### 5.4 Time Series Analysis & Forecasting
Once monthly sales differences were confirmed significant, the project proceeded to:
- Forecast the next **18 months** of weekly sales by month
- Predict the **percentage change in sales** by month
- Translate sales change predictions into **dynamic pricing strategy recommendations**

---

## 6. Key Outputs & Artifacts

| File | Description |
|---|---|
| [README.md](README.md) | Project overview, tools, methodology, and highlights |
| [analysis_modeling/dynamic_pricing_model_webscraping_cleaning_analytics.ipynb](analysis_modeling/dynamic_pricing_model_webscraping_cleaning_analytics.ipynb) | Web scraping, data cleaning, and initial analytics notebook |
| [analysis_modeling/dynamic_pricing_model_kmeansclustering.ipynb](analysis_modeling/dynamic_pricing_model_kmeansclustering.ipynb) | K-Means clustering model and customer segmentation |
| [analysis_modeling/dynamic_pricing_model_stats_timeseries_finalmodel.ipynb](analysis_modeling/dynamic_pricing_model_stats_timeseries_finalmodel.ipynb) | ANOVA, time series analysis, and final dynamic pricing model |
| [databricks/etl_pipeline.ipynb](databricks/etl_pipeline.ipynb) | PySpark ETL pipeline notebook |
| [databricks/sql_code](databricks/sql_code) | SQL queries for data transformation and analysis |
| [anova_result.png](anova_result.png) | ANOVA result visualisation |
| [kmeans_clustering_model_3d.png](kmeans_clustering_model_3d.png) | 3D scatter plot of K-Means clusters |
| [violinplot_kmeansclusters.png](violinplot_kmeansclusters.png) | Violin plots for cluster analysis |
| [dynamic_pricing_model!.png](dynamic_pricing_model!.png) | Final model overview illustration |

---

## 7. Key Insights

- **Store size matters:** Average weekly sales vary significantly by store size category (Type A vs. Type B).
- **Monthly seasonality:** ANOVA confirms statistically significant differences in weekly sales across months, driving the need for month-specific pricing strategies.
- **Discount classification:** Percentile-based categorisation (No Discount → Max Discount) provides a practical framework for analysing the impact of markdowns on revenue.
- **Correlation findings:** Linear regression correlations were computed between external factors (temperature, fuel price, CPI, unemployment, discounts) and daily sales, informing which variables most strongly influence pricing decisions.
- **Customer segmentation:** K-Means clustering identifies distinct customer/store behaviour groups, enabling targeted pricing strategies per segment.

---

## 8. Conclusion

This project demonstrates a full-stack data science workflow — from web scraping and ETL to statistical testing, machine learning, and forecasting — applied to a real-world retail pricing problem. The resulting Dynamic Pricing Model uses historical sales patterns, macroeconomic indicators, and customer segments to recommend pricing adjustments month-by-month over an 18-month horizon.

The integration of Python analytics, Databricks/PySpark engineering, and Tableau visualisation showcases a modern, production-oriented approach to retail data science.
