import pandas as pd
import numpy as np
from datetime import datetime

def create_consolidated_report():
    # Read both CSV files
    df1 = pd.read_csv('/Users/yoga.wigardo/Workspaces/bangCRM/report/customer_report_20250826.csv')
    df2 = pd.read_csv('/Users/yoga.wigardo/Workspaces/bangCRM/report/customers_activities_20250825to20251124.csv')

    # Clean up customer names for matching
    df1['CustomerName_clean'] = df1['CustomerName'].str.strip().str.lower()
    df2['Customer_clean'] = df2['Customer'].str.strip().str.lower()

    # Merge the dataframes on customer name
    merged_df = pd.merge(df1, df2, left_on='CustomerName_clean', right_on='Customer_clean', how='outer')

    # Create the consolidated report with required columns
    consolidated = pd.DataFrame()

    # Name - use CustomerName from df1, fallback to Customer from df2
    consolidated['Name'] = np.where(merged_df['CustomerName'].notna(),
                                   merged_df['CustomerName'],
                                   merged_df['Customer'])

    # Number of Completed Classes - from df1.Completed
    consolidated['Number of Completed Classes'] = merged_df['Completed'].fillna(0)

    # Number of Late Cancel - from df1."Late Cancelled"
    consolidated['Number of Late Cancel'] = merged_df['Late Cancelled'].fillna(0)

    # Total - from df1."Total Booking"
    consolidated['Total'] = merged_df['Total Booking'].fillna(0)

    # Revenue - from df2."Total spending amount"
    consolidated['Revenue'] = pd.to_numeric(merged_df['Total spending amount'], errors='coerce').fillna(0)

    # Average Revenue - calculate from Revenue and Completed Classes (avoid division by zero)
    completed_classes = consolidated['Number of Completed Classes']
    consolidated['Average Revenue'] = np.where(completed_classes > 0,
                                             consolidated['Revenue'] / completed_classes,
                                             0)

    # Number of Credits Left - placeholder as not found in the files
    consolidated['Number of Credits Left'] = 'N/A'

    # Count of "1 Free Class Pass" - placeholder as not found in the files
    consolidated['Count of "1 Free Class Pass"'] = 'N/A'

    # Days from Last Completed Class - from df2."Days since last class"
    consolidated['Days from Last Completed Class'] = merged_df['Days since last class'].fillna('N/A')

    # Days from Last Package Purchase - from df2."Days since package purchase"
    consolidated['Days from Last Package Purchase'] = merged_df['Days since package purchase'].fillna('N/A')

    # Days from Last Drop In Purchase - from df2."Days since drop in purchase"
    consolidated['Days from Last Drop In Purchase'] = merged_df['Days since drop in purchase'].fillna('N/A')

    # Date Joined - use JoinedDate from df1, fallback to Date joined from df2
    consolidated['Date Joined'] = np.where(merged_df['JoinedDate'].notna(),
                                          merged_df['JoinedDate'],
                                          merged_df['Date joined'])

    # Email - use Email from df1, fallback to Email from df2
    consolidated['Email'] = np.where(merged_df['Email_x'].notna(),
                                    merged_df['Email_x'],
                                    merged_df['Email_y'])

    # Phone Number - use MobileCode + Mobile from df1, fallback to Mobile from df2
    df1['phone_full'] = np.where(df1['MobileCode'].notna() & df1['Mobile'].notna(),
                                '+' + df1['MobileCode'].astype(str) + ' ' + df1['Mobile'].astype(str),
                                np.nan)

    # Create temporary phone columns from the merged data
    merged_df['phone_from_df1'] = np.where(merged_df['MobileCode'].notna() & merged_df['Mobile_x'].notna(),
                                         '+' + merged_df['MobileCode'].astype(str) + ' ' + merged_df['Mobile_x'].astype(str),
                                         np.nan)

    consolidated['Phone Number'] = np.where(merged_df['phone_from_df1'].notna(),
                                          merged_df['phone_from_df1'],
                                          merged_df['Mobile_y'])

    # Birthday - from df1.DateOfBirth
    consolidated['Birthday'] = merged_df['DateOfBirth']

    # Save to CSV
    output_path = '/Users/yoga.wigardo/Workspaces/bangCRM/report/consolidated_customer_report.csv'
    consolidated.to_csv(output_path, index=False)

    print(f"Consolidated report saved to: {output_path}")
    print(f"Total records: {len(consolidated)}")

    # Display first few rows
    print("\nFirst 5 records:")
    print(consolidated.head().to_string())

    return consolidated

if __name__ == "__main__":
    report = create_consolidated_report()