import pandas as pd
import numpy as np
from datetime import datetime

def consolidate_customer_reports():
    # Read the customer report CSV
    customer_report_path = 'customer_report_20240101.csv'
    activities_report_path = 'customers_activities_20231231to20241231.csv'
    output_path = 'consolidated_customer_report_20240101.csv'

    try:
        # Read customer report
        df_customers = pd.read_csv(customer_report_path)
        print(f"Loaded {len(df_customers)} customer records")

        # Read activities report
        df_activities = pd.read_csv(activities_report_path)
        print(f"Loaded {len(df_activities)} activity records")

        # Clean email and mobile in activities to match format in customers
        df_activities['Email_clean'] = df_activities['Email'].str.lower().str.strip()
        df_customers['Email_clean'] = df_customers['Email'].str.lower().str.strip()

        # Clean mobile numbers in activities to match format in customers
        df_activities['Mobile_clean'] = df_activities['Mobile'].str.replace(r'[^\d]', '', regex=True)
        df_customers['Mobile_clean'] = df_customers['Mobile'].astype(str).str.replace(r'[^\d]', '', regex=True)

        # Drop duplicates in activities data - keep only the most recent record for each customer
        df_activities_unique = df_activities.drop_duplicates(subset=['Email_clean'], keep='first')

        # Merge datasets based on email first
        df_merged = pd.merge(df_customers, df_activities_unique,
                           left_on='Email_clean',
                           right_on='Email_clean',
                           how='left',
                           suffixes=('', '_act'))

        print(f"After email merge: {len(df_merged)} records")

        # For records that didn't match on email, try matching on mobile
        email_unmatched = df_merged[df_merged['Date joined'].isna()].copy()
        email_matched = df_merged[df_merged['Date joined'].notna()].copy()

        if len(email_unmatched) > 0:
            print(f"Trying mobile match for {len(email_unmatched)} unmatched records")

            # For mobile matching, find the best match for each unmatched customer
            activity_cols = [
                'Date joined', 'Days since first joined', 'Days since last class',
                'Days since last appointment', 'Days since outlet access',
                'Days since package purchase', 'Days since membership purchase',
                'Days since drop in purchase', 'Days since course purchase',
                'Days since member', 'Days since non member', 'Days since lost member',
                'Total class completed', 'Total appointment completed',
                'Total outlet access completed', 'Total courses completed',
                'Total spending amount'
            ]

            # Match unmatched records on mobile
            for idx, row in email_unmatched.iterrows():
                mobile_clean = str(row['Mobile_clean'])
                matching_activities = df_activities_unique[df_activities_unique['Mobile_clean'] == mobile_clean]

                if len(matching_activities) > 0:
                    # Take the first match (could be improved with better matching logic)
                    match_data = matching_activities.iloc[0]
                    for col in activity_cols:
                        if col in match_data.index:
                            email_unmatched.at[idx, col] = match_data[col]

        # Combine matched and mobile-matched records
        df_final = pd.concat([email_matched, email_unmatched], ignore_index=True)
        print(f"Final consolidated dataset: {len(df_final)} records")

        # Select and reorder columns for final output
        customer_columns = [
            'CustomerName', 'MobileCode', 'Mobile', 'Email', 'DateOfBirth', 'Gender',
            'AddressLine1', 'AddressLine2', 'City', 'State', 'PostalCode', 'Country',
            'Group', 'Tag', 'Membership', 'JoinedDate', 'Channel', 'Status',
            'Completed', 'Booked', 'No Show', 'Cancelled', 'Late Cancelled',
            'Waitlist Cancelled', 'Waitlist Expired', 'Total Booking'
        ]

        activity_columns = [
            'Date joined', 'Days since first joined', 'Days since last class',
            'Days since last appointment', 'Days since outlet access',
            'Days since package purchase', 'Days since membership purchase',
            'Days since drop in purchase', 'Days since course purchase',
            'Days since member', 'Days since non member', 'Days since lost member',
            'Total class completed', 'Total appointment completed',
            'Total outlet access completed', 'Total courses completed',
            'Total spending amount'
        ]

        final_columns = customer_columns + activity_columns

        # Select only existing columns
        existing_columns = [col for col in final_columns if col in df_final.columns]
        df_output = df_final[existing_columns].copy()

        # Clean up temporary columns
        temp_cols = [col for col in df_output.columns if '_clean' in col or col.endswith('_act')]
        df_output = df_output.drop(columns=temp_cols, errors='ignore')

        # Save consolidated report
        df_output.to_csv(output_path, index=False)
        print(f"Consolidated report saved to {output_path}")

        # Print summary statistics
        print("\n=== CONSOLIDATION SUMMARY ===")
        print(f"Total customers in customer report: {len(df_customers)}")
        print(f"Total records in activities report: {len(df_activities)}")
        print(f"Total consolidated records: {len(df_output)}")

        # Check matches
        email_matches = len(email_matched)
        mobile_matches = len(df_final[df_final['Date joined'].notna()]) - email_matches
        unmatched = len(df_final[df_final['Date joined'].isna()])

        print(f"Email matches: {email_matches}")
        print(f"Mobile matches: {mobile_matches}")
        print(f"Unmatched: {unmatched}")

        # Sample of consolidated data
        print("\n=== SAMPLE CONSOLIDATED DATA ===")
        sample_data = df_output.head(3)
        for col in sample_data.columns:
            if sample_data[col].notna().any():
                print(f"{col}: {sample_data[col].iloc[0] if pd.notna(sample_data[col].iloc[0]) else 'N/A'}")

        return df_output

    except Exception as e:
        print(f"Error consolidating reports: {str(e)}")
        return None

if __name__ == "__main__":
    consolidate_customer_reports()