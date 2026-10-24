import io
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_sales_df() -> pd.DataFrame:
    """
    Generates a realistic 6-month B2B SaaS analytics dataset.
    Columns: Date, Product, Category, Region, Customer_Segment, Quantity, Unit_Price, Revenue, Discount_Pct, Payment_Status, Satisfaction_Score
    """
    np.random.seed(42)
    start_date = datetime(2026, 5, 1)
    days = 150
    
    products = [
        ("DataPilot Studio", "Analytics", 299),
        ("Quantum Engine", "Analytics", 599),
        ("Emerald Cloud", "Infrastructure", 450),
        ("CyberGuard AI", "Security", 380),
        ("Pipeline Pro", "Infrastructure", 199),
        ("AI Copilot Addon", "AI Services", 150)
    ]
    regions = ["North America", "Europe", "Asia-Pacific", "Latin America"]
    segments = ["Enterprise", "Mid-Market", "Fast-Growth Startup", "Public Sector"]
    statuses = ["Completed", "Completed", "Completed", "Pending", "Failed"]
    
    records = []
    current_date = start_date
    
    for day in range(days):
        date_str = current_date.strftime("%Y-%m-%d")
        # generate 5 to 15 transactions per day with slight growth trend
        daily_tx_count = np.random.randint(6, 16) + int(day / 30)
        
        for _ in range(daily_tx_count):
            prod_info = products[np.random.choice(len(products), p=[0.25, 0.20, 0.20, 0.15, 0.12, 0.08])]
            prod_name, category, base_price = prod_info
            
            region = np.random.choice(regions, p=[0.42, 0.28, 0.20, 0.10])
            segment = np.random.choice(segments, p=[0.35, 0.35, 0.20, 0.10])
            quantity = np.random.choice([1, 2, 3, 5, 10, 20], p=[0.40, 0.30, 0.15, 0.08, 0.05, 0.02])
            
            # Enterprise buys higher quantities
            if segment == "Enterprise" and np.random.random() < 0.2:
                quantity *= 3
                
            unit_price = base_price * np.random.uniform(0.90, 1.10)
            discount_pct = np.random.choice([0, 5, 10, 15, 20], p=[0.50, 0.20, 0.15, 0.10, 0.05])
            gross = quantity * unit_price
            revenue = round(gross * (1 - discount_pct / 100), 2)
            unit_price = round(unit_price, 2)
            
            status = np.random.choice(statuses)
            csat = round(float(np.random.normal(4.6, 0.4)), 1)
            csat = min(5.0, max(1.0, csat))
            
            records.append({
                "Date": date_str,
                "Product": prod_name,
                "Category": category,
                "Region": region,
                "Customer_Segment": segment,
                "Quantity": int(quantity),
                "Unit_Price": unit_price,
                "Discount_Pct": discount_pct,
                "Revenue": revenue,
                "Payment_Status": status,
                "Satisfaction_Score": csat
            })
            
        current_date += timedelta(days=1)
        
    df = pd.DataFrame(records)
    # Add a few known intentional outliers for anomaly detection demonstration
    df.loc[12, "Revenue"] = 48500.00
    df.loc[88, "Revenue"] = 62000.00
    df.loc[145, "Quantity"] = 250
    return df

def get_sample_csv_bytes() -> bytes:
    df = generate_sample_sales_df()
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    return buf.getvalue().encode('utf-8')
