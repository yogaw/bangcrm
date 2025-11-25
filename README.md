# Bang! CRM - Customer Profiles Feature

## 🚀 New Feature: Customer Profiles Analysis

### Overview
We've added a new **Customer Profiles** section that provides advanced insights into your top customers with calculated revenue metrics and performance analysis.

### 📊 What's New

#### 1. Main Dashboard Updates
- **New CTA Button**: "📊 View Customer Profiles" button in the header
- **Data Status Notice**: Clear indication that current data needs updating
- **Seamless Navigation**: Direct access to customer profiles analysis

#### 2. Customer Profiles Page (`customer-profiles.html`)
- **Comprehensive Data Display**: Shows all 9 profile customers with complete metrics
- **Revenue Analysis**: Total revenue, average revenue per customer and per class
- **Performance Ranking**: Customers ranked by total revenue (highest first)
- **Visual Performance Indicators**: Color-coded revenue levels with badges

#### 3. Key Metrics Displayed
- **Customer Name**: Profile customer details
- **Contact Information**: Email and mobile numbers
- **Classes Attended**: Total classes completed by each customer
- **Completion Rate**: Booking completion percentage
- **Total Revenue**: Total spending per customer
- **Average Revenue per Class**: Calculated revenue efficiency metric
- **Performance Level**: Elite (≥250K), Premium (≥200K), Standard, or New customers

### 📈 Data Sources
- **Primary Data**: `report/simplified_customer_profiles.csv`
- **Real-time Calculations**: Average revenue per customer and per class
- **Customer Count**: 9 profile customers analyzed

### 🎯 Key Insights Available

#### Top Performing Customers
1. **Helena S**: ₩23,952,650 total (174 classes)
2. **Tri Wulandari**: ₩17,947,750 total (75 classes)
3. **Guntur Mallarangeng**: ₩15,656,000 total (76 classes)

#### Highest Revenue Per Class
1. **Jonathan Edward**: ₩257,500 per class (2 classes)
2. **Tri Wulandari**: ₩239,303 per class (75 classes)
3. **Angie Giovanni**: ₩246,342 per class (27 classes)

### 🎨 Design Features
- **Responsive Design**: Works on desktop and mobile devices
- **Color Coding**: High revenue customers highlighted
- **Performance Badges**: Visual indicators for customer performance levels
- **Easy Navigation**: Back button to return to main dashboard
- **Clean Interface**: Streamlined data presentation

### 📁 File Structure
```
/Users/yoga.wigardo/Workspaces/bangCRM/
├── index.html (updated with CTA button)
├── customer-profiles.html (NEW)
├── customer-profiles.js (NEW)
├── index.css (updated with new styles)
├── report/
│   └── simplified_customer_profiles.csv (data source)
└── README.md (this file)
```

### 🔧 Technical Details
- **Data Loading**: Asynchronous CSV parsing
- **Currency Formatting**: Indonesian Rupiah (IDR) formatting
- **Performance Calculations**: Real-time revenue analysis
- **Error Handling**: Graceful data loading error messages

### 🚀 Getting Started
1. Open `index.html` to see the main dashboard with the new CTA button
2. Click "📊 View Customer Profiles" to access the analysis page
3. Review the comprehensive customer insights and revenue metrics

### 📊 Summary Statistics
- **Total Customers**: 9
- **Total Revenue**: ₩80,767,450
- **Average Revenue per Customer**: ₩159,232
- **Average Revenue per Class**: ₩167,567

This feature provides actionable insights into your most valuable customers and helps identify revenue optimization opportunities.