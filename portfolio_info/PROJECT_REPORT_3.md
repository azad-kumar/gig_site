# Supply Chain Analytics Dashboard — Project Report

## 1. Project Overview

**Supply Chain Analytics** is an end-to-end data analytics project that tracks inventory health, supplier performance, and shipment delays across a network of warehouses and suppliers in India. The project generates synthetic but realistic supply chain data, loads it into a PostgreSQL relational database, runs business intelligence queries, and delivers insights through an interactive Power BI dashboard and an exported Excel analysis report.

The primary goal is to provide decision-makers with a clear view of operational KPIs — from stock-out risks and warehouse utilization to carrier reliability and monthly procurement spend trends.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Data Generation | Python 3 · Pandas · NumPy · Faker (`en_IN`) |
| Database | PostgreSQL · SQLAlchemy ORM |
| Analysis | Python · SQLAlchemy `text()` · Pandas `read_sql` |
| Visualization | Microsoft Power BI (`.pbix`) |
| Export | OpenPyXL (multi-sheet Excel) |

---

## 3. Project Structure

```
supply-chain-analytics/
├── data/
│   ├── warehouses.csv              (10 rows)
│   ├── suppliers.csv               (50 rows)
│   ├── products.csv                (300 rows)
│   ├── inventory.csv               (300 rows)
│   ├── purchase_orders.csv         (2,000 rows)
│   ├── shipments.csv               (~1,300 rows)
│   ├── supply_chain_data.xlsx      (all sheets combined)
│   └── supply_chain_analysis.xlsx  (8 analysis sheets)
├── python/
│   ├── load_to_postgres.py         # CSV → PostgreSQL loader
│   └── analysis.py                 # Business-metric queries + Excel export
├── generate_data.py                # Full synthetic data generator
├── README.md
├── dashboard_preview.png
└── Supply_Chain_Dashboard.pbix     # Power BI dashboard
```

---

## 4. Data Model & Schema

The database contains six core tables with clear foreign-key relationships:

### 4.1 Warehouses (`warehouses`)

| Column | Type | Description |
|---|---|---|
| `warehouse_id` | text (PK) | e.g. `WH001`–`WH010` |
| `warehouse_name` | text | e.g. "Mumbai Warehouse" |
| `city` | text | One of 10 major Indian cities |
| `capacity_units` | int | Maximum storage capacity |
| `used_units` | int | Currently utilized capacity |
| `utilization_pct` | float | `used / capacity × 100` |
| `manager` | text | Faker-generated Indian name |

**Coverage:** Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow.

### 4.2 Suppliers (`suppliers`)

| Column | Type | Description |
|---|---|---|
| `supplier_id` | text (PK) | e.g. `SUP001`–`SUP050` |
| `supplier_name` | text | Faker-generated company names |
| `country` | text | India, China, USA, Germany, Japan, South Korea, Taiwan, Vietnam, Bangladesh, Mexico |
| `category` | text | Electronics, Clothing, Home & Kitchen, Books, Sports, Beauty, Raw Materials, Packaging |
| `reliability_score` | float | 60–99 range |
| `avg_lead_days` | int | 3–45 days |
| `defect_rate_pct` | float | 0.1–8.0% |
| `contract_start` | date | 2020–2022 range |
| `is_active` | boolean | ~90% active |

### 4.3 Products (`products`)

| Column | Type | Description |
|---|---|---|
| `product_id` | text (PK) | `PROD0001`–`PROD0300` |
| `product_name` | text | Category-specific names with Pro/Lite/Plus/Max suffixes |
| `category` | text | 6 product categories |
| `supplier_id` | text (FK) | Links to `suppliers` |
| `warehouse_id` | text (FK) | Links to `warehouses` |
| `unit_cost` | float | ₹50 – ₹15,000 |
| `selling_price` | float | `unit_cost × 1.2–2.5` |
| `reorder_point` | int | 50–300 units |
| `reorder_quantity` | int | `reorder_point × 2–5` |
| `weight_kg` | float | 0.1–25 kg |

### 4.4 Inventory (`inventory`)

| Column | Type | Description |
|---|---|---|
| `inventory_id` | text (PK) | `INVPRODxxxx` |
| `product_id` | text (FK) | Links to `products` |
| `warehouse_id` | text (FK) | Links to `warehouses` |
| `current_stock` | int | 0–1000 units |
| `reorder_point` | int | Product-level reorder threshold |
| `reorder_quantity` | int | Suggested order quantity |
| `stock_status` | text | Out of Stock / Low Stock / Healthy / Overstock |
| `last_updated` | date | Oct–Dec 2024 |
| `days_of_supply` | float | `current_stock / avg_daily_usage` |

**Status logic:**
- `Out of Stock` — `current_stock == 0`
- `Low Stock` — `current_stock < reorder_point`
- `Overstock` — `current_stock > reorder_point × 4`
- `Healthy` — everything else

### 4.5 Purchase Orders (`purchase_orders`)

| Column | Type | Description |
|---|---|---|
| `po_id` | text (PK) | `PO00001`–`PO2000` |
| `product_id` | text (FK) | Links to `products` |
| `supplier_id` | text (FK) | Links to `suppliers` |
| `warehouse_id` | text (FK) | Links to `warehouses` |
| `order_date` | date | Jan 2023 – Dec 2024 |
| `expected_date` | date | `order_date + lead_days` |
| `actual_date` | date | Null if not delivered |
| `quantity_ordered` | int | 50–500 |
| `unit_cost` | float | From product table |
| `total_cost` | float | `quantity × unit_cost` |
| `status` | text | Delivered / In Transit / Pending / Cancelled |
| `delay_days` | int | 0+ (max 10 for delivered POs) |
| `lead_time_days` | int | Supplier-dependent |

### 4.6 Shipments (`shipments`)

| Column | Type | Description |
|---|---|---|
| `shipment_id` | text (PK) | `SHIP00001`–`SHIP1300+` |
| `po_id` | text (FK) | Links to `purchase_orders` |
| `carrier` | text | BlueDart, DTDC, Delhivery, FedEx, Ecom Express, XpressBees, India Post |
| `route` | text | e.g. "Mumbai → Kolkata" |
| `ship_date` | date | |
| `expected_delivery` | date | |
| `actual_delivery` | date | Null if not yet delivered |
| `status` | text | Delivered / In Transit / Delayed / Returned |
| `delay_days` | int | 0+ |
| `on_time` | boolean | 1 if `delay_days == 0` |
| `shipping_cost` | float | ₹500–₹8,000 |
| `weight_kg` | float | 1–500 kg |

---

## 5. Data Generation (`generate_data.py`)

The script uses a fixed random seed (`42`) for reproducibility and Faker with the `en_IN` locale for realistic Indian names and companies.

### Generation pipeline (in order):

1. **Warehouses** — 10 entries with randomized capacity (5,000–20,000) and utilization (40–95%).
2. **Suppliers** — 50 entries across 10 countries and 8 categories with randomized reliability, lead times, and defect rates.
3. **Products** — 300 entries distributed across 6 categories (Electronics: 40, Clothing: 60, Home & Kitchen: 50, Books: 40, Sports: 50, Beauty: 60). Each product is linked to a supplier from a matching category pool.
4. **Inventory** — One record per product with stock levels 0–1000 and derived status labels.
5. **Purchase Orders** — 2,000 orders spanning Jan 2023–Dec 2024, with statuses weighted toward "Delivered" and delay amounts sampled from a weighted distribution.
6. **Shipments** — Generated for all non-pending/cancelled POs, with carrier assignment, route generation (cross-city), and delay modeling.

All tables are exported as individual CSVs and as a combined Excel workbook (`supply_chain_data.xlsx`).

---

## 6. Database Loading (`python/load_to_postgres.py`)

The loader connects to a local PostgreSQL instance on `localhost:5432` with database name `supply_chain_db`. It:

1. Truncates each table (with `CASCADE`) to ensure a clean reload.
2. Reads each CSV and appends rows via `to_sql()`.
3. Tables are loaded in referential-order: warehouses → suppliers → products → inventory → purchase_orders → shipments.

---

## 7. Business Analysis (`python/analysis.py`)

The analysis script runs eight SQL queries against PostgreSQL and exports the results to a multi-sheet Excel workbook (`data/supply_chain_analysis.xlsx`).

### 7.1 Query Summary

| # | Analysis | Key Metrics |
|---|---|---|
| 1 | **Inventory Health** | Count, %, avg stock, avg days of supply by status |
| 2 | **Warehouse Utilization** | Name, city, capacity, used, utilization %, level bucket (Critical/High/Medium/Low), products stored |
| 3 | **Supplier Performance** | Top 20 by on-time %: orders, avg lead time, avg delay, total spend, on-time delivery rate |
| 4 | **Monthly PO Trends** | Month-over-month: order count, total spend, avg lead time, avg delay, on-time % |
| 5 | **Carrier Performance** | Per carrier: shipments, avg delay, on-time %, avg & total shipping cost |
| 6 | **Category Inventory** | Per product category: total products, total/avg stock, out-of-stock/low-stock/overstock counts, avg days of supply |
| 7 | **Shipment Delay Analysis** | Delay buckets (On Time / 1–3 / 4–7 / 7+ days): count, %, avg shipping cost |
| 8 | **Reorder Urgency** | Top 10 products by lowest days of supply among Low/Out-of-Stock items, with supplier and lead-time data |

### 7.2 Export

Results are written to `data/supply_chain_analysis.xlsx` with eight named sheets, ready for Power BI connection or further manual analysis.

---

## 8. Power BI Dashboard

The `Supply_Chain_Dashboard.pbix` file contains a five-page interactive report:

| Page | Focus |
|---|---|
| 1. Executive Summary | KPI cards, inventory health overview, carrier performance at-a-glance |
| 2. Inventory Analysis | Stock status breakdown, reorder urgency, days-of-supply heatmaps |
| 3. Supplier Performance | On-time rates, defect rates, supplier scorecards |
| 4. Order & Delivery Tracking | Monthly spend trends, delay distributions |
| 5. Warehouse Operations | Capacity vs. usage, utilization level heatmaps across 10 locations |

A static preview is available as `dashboard_preview.png`.

---

## 9. Key Business Insights (from project README)

- **Only 28.8% of shipments delivered on time** — a major logistics gap identified across all carriers.
- **Average shipment delay of 1.9 days** across all carriers.
- **Multiple products flagged for critical reorder urgency** — several items have days-of-supply below 1.
- **Warehouse utilization imbalances detected** across the 10-location network (ranging from ~42% to ~92%).

---

## 10. How to Run

### Prerequisites
```bash
pip install pandas faker sqlalchemy psycopg2-binary openpyxl
```

### Steps
1. **Generate data:**
   ```bash
   python generate_data.py
   ```
2. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE supply_chain_db;
   ```
   Then run the DDL script (referenced in README as `sql/01_create_tables.sql`).
3. **Load data into PostgreSQL:**
   ```bash
   python python/load_to_postgres.py
   ```
   _(Edit `PASSWORD` in the script to match your PostgreSQL credentials.)_
4. **Run analysis:**
   ```bash
   python python/analysis.py
   ```
   Output: `data/supply_chain_analysis.xlsx`
5. **Open dashboard:**
   Launch `Supply_Chain_Dashboard.pbix` in Power BI Desktop.

---

## 11. Dataset Statistics Summary

| Table | Rows | Columns |
|---|---|---|
| Warehouses | 10 | 7 |
| Suppliers | 50 | 9 |
| Products | 300 | 10 |
| Inventory | 300 | 9 |
| Purchase Orders | 2,000 | 13 |
| Shipments | ~1,300 | 12 |

**Total records:** ~3,960 across six tables.

---

## 12. Data Quality Notes

- All data is **synthetically generated** with a fixed seed — results are reproducible but not real-world.
- The `shipments` table excludes entries for `Pending` and `Cancelled` purchase orders.
- `delay_days` in purchase orders uses a weighted distribution favoring small delays (0–2 days) with a long tail to 10 days.
- Some suppliers are marked `is_active = false` (~10%), providing a realistic mix for analysis.
- The `.gitignore` is configured to exclude CSV data files to keep the repository lightweight.

---

## 13. Conclusions

This project demonstrates a complete data pipeline — from synthetic data generation through relational storage, analytical querying, and executive visualization. The simulated supply chain network (10 warehouses, 50 suppliers, 300 products, 2,000 orders) is large enough to surface meaningful patterns (low on-time delivery rates, stock imbalances, carrier performance disparities) while remaining simple enough for rapid iteration and educational exploration. The modular Python scripts and Power BI dashboard make it suitable as a portfolio project, a training dataset for analytics workshops, or a starting template for real supply chain monitoring systems.
