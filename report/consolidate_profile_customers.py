import pandas as pd
import numpy as np
from datetime import datetime

def create_profile_consolidated_report():
    # File paths
    profiles_path = 'customer_profiles.csv'
    customer_report_path = 'customer_report_20240101.csv'
    activities_report_path = 'customers_activities_20231231to20241231.csv'
    output_path = 'consolidated_customer_profiles_report.csv'

    try:
        # Read all files
        df_profiles = pd.read_csv(profiles_path)
        df_customers = pd.read_csv(customer_report_path)
        df_activities = pd.read_csv(activities_report_path)

        print(f"Loaded {len(df_profiles)} customer profiles")
        print(f"Loaded {len(df_customers)} customer report records")
        print(f"Loaded {len(df_activities)} activity records")

        # Extract emails from profiles for matching
        profile_emails = set(df_profiles['email'].str.lower().str.strip())
        print(f"Target customers: {profile_emails}")

        # Clean data for matching
        df_customers['Email_clean'] = df_customers['Email'].str.lower().str.strip()
        df_activities['Email_clean'] = df_activities['Email'].str.lower().str.strip()

        # Clean mobile numbers
        df_customers['Mobile_clean'] = df_customers['Mobile'].astype(str).str.replace(r'[^\d]', '', regex=True)
        df_activities['Mobile_clean'] = df_activities['Mobile'].str.replace(r'[^\d]', '', regex=True)

        # Drop duplicates in activities
        df_activities_unique = df_activities.drop_duplicates(subset=['Email_clean'], keep='first')

        # Filter customer report to only include profiles customers
        df_customers_filtered = df_customers[df_customers['Email_clean'].isin(profile_emails)]
        print(f"Found {len(df_customers_filtered)} matching customers in report")

        # Filter activities to only include profiles customers
        df_activities_filtered = df_activities_unique[df_activities_unique['Email_clean'].isin(profile_emails)]
        print(f"Found {len(df_activities_filtered)} matching activity records")

        # Merge datasets based on email
        df_merged = pd.merge(
            df_customers_filtered,
            df_activities_filtered,
            left_on='Email_clean',
            right_on='Email_clean',
            how='left',
            suffixes=('', '_act')
        )

        print(f"After merge: {len(df_merged)} records")

        # Add profile data
        # Create a lookup dictionary from profiles
        profile_lookup = df_profiles.set_index('email')[[
            'customerId', 'name', 'joinedOn', 'isEmailVerified',
            'totalSpendedAmount', 'totalBooking', 'totalAttendedClass'
        ]].to_dict('index')

        # Add profile columns
        df_merged['customerId'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('customerId', ''))
        df_merged['profile_name'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('name', ''))
        df_merged['profile_joinedOn'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('joinedOn', ''))
        df_merged['isEmailVerified'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('isEmailVerified', ''))
        df_merged['profile_totalSpendedAmount'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('totalSpendedAmount', 0))
        df_merged['profile_totalBooking'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('totalBooking', 0))
        df_merged['profile_totalAttendedClass'] = df_merged['Email_clean'].map(lambda x: profile_lookup.get(x, {}).get('totalAttendedClass', 0))

        # Select and reorder columns for final output
        columns = [
            'customerId', 'CustomerName', 'profile_name',
            'MobileCode', 'Mobile', 'telephone',
            'Email', 'isEmailVerified',
            'DateOfBirth', 'Gender',
            'AddressLine1', 'AddressLine2', 'City', 'State', 'PostalCode', 'Country',
            'Group', 'Tag', 'Membership',
            'JoinedDate', 'profile_joinedOn', 'Channel',
            'Status', 'suspendReason',
            'Completed', 'Booked', 'No Show', 'Cancelled', 'Late Cancelled',
            'Waitlist Cancelled', 'Waitlist Expired', 'Total Booking',
            'profile_totalBooking', 'profile_totalAttendedClass',
            'Date joined', 'Days since first joined', 'Days since last class',
            'Days since last appointment', 'Days since outlet access',
            'Days since package purchase', 'Days since membership purchase',
            'Days since drop in purchase', 'Days since course purchase',
            'Days since member', 'Days since non member', 'Days since lost member',
            'Total class completed', 'Total appointment completed',
            'Total outlet access completed', 'Total courses completed',
            'profile_totalSpendedAmount', 'Total spending amount',
            'parentUserId', 'isChild'
        ]

        # Select only existing columns
        existing_columns = [col for col in columns if col in df_merged.columns]
        df_output = df_merged[existing_columns].copy()

        # Clean up temporary columns
        temp_cols = [col for col in df_output.columns if '_clean' in col or col.endswith('_act')]
        df_output = df_output.drop(columns=temp_cols, errors='ignore')

        # Save consolidated report
        df_output.to_csv(output_path, index=False)
        print(f"Profile consolidated report saved to {output_path}")

        # Print summary statistics
        print("\n=== PROFILE CONSOLIDATION SUMMARY ===")
        print(f"Target customers from profiles: {len(df_profiles)}")
        print(f"Customers found in report: {len(df_customers_filtered)}")
        print(f"Customers found in activities: {len(df_activities_filtered)}")
        print(f"Final consolidated records: {len(df_output)}")

        # Show some sample data
        print("\n=== SAMPLE CONSOLIDATED DATA ===")
        if len(df_output) > 0:
            print(f"Sample customer: {df_output.iloc[0]['CustomerName'] if 'CustomerName' in df_output.columns else 'N/A'}")
            print(f"Profile spending: {df_output.iloc[0]['profile_totalSpendedAmount'] if 'profile_totalSpendedAmount' in df_output.columns else 'N/A'}")
            print(f"Report spending: {df_output.iloc[0]['Total spending amount'] if 'Total spending amount' in df_output.columns else 'N/A'}")

        return df_output

    except Exception as e:
        print(f"Error creating profile consolidation: {str(e)}")
        return None

if __name__ == "__main__":
    create_profile_consolidated_report()