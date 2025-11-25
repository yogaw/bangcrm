import pandas as pd

def clean_profile_report():
    # Read the current profile report
    input_path = 'consolidated_customer_profiles_report.csv'
    output_path = 'consolidated_customer_profiles_clean.csv'

    try:
        df = pd.read_csv(input_path)
        print(f"Loaded {len(df)} records from profile report")

        # Columns to remove
        columns_to_remove = [
            'customerId', 'profile_name', 'isEmailVerified', 'Gender',
            'AddressLine1', 'AddressLine2', 'City', 'State', 'PostalCode', 'Country',
            'Group', 'Tag', 'profile_joinedOn', 'Channel', 'Status'
        ]

        # Remove specified columns
        df_clean = df.drop(columns=columns_to_remove, errors='ignore')
        print(f"Removed {len(columns_to_remove)} columns")

        # Define final column order matching consolidated_customer_report structure
        final_columns = [
            'CustomerName', 'MobileCode', 'Mobile', 'Email', 'DateOfBirth',
            'Membership', 'JoinedDate',
            'Completed', 'Booked', 'No Show', 'Cancelled', 'Late Cancelled',
            'Waitlist Cancelled', 'Waitlist Expired', 'Total Booking',
            'Date joined', 'Days since first joined', 'Days since last class',
            'Days since last appointment', 'Days since outlet access',
            'Days since package purchase', 'Days since membership purchase',
            'Days since drop in purchase', 'Days since course purchase',
            'Days since member', 'Days since non member', 'Days since lost member',
            'Total class completed', 'Total appointment completed',
            'Total outlet access completed', 'Total courses completed',
            'Total spending amount',
            'profile_totalSpendedAmount', 'profile_totalBooking', 'profile_totalAttendedClass'
        ]

        # Select only existing columns in the right order
        existing_columns = [col for col in final_columns if col in df_clean.columns]
        df_final = df_clean[existing_columns].copy()

        # Rename columns for consistency
        column_mapping = {
            'CustomerName': 'CustomerName',
            'MobileCode': 'MobileCode',
            'Mobile': 'Mobile',
            'Email': 'Email',
            'DateOfBirth': 'DateOfBirth',
            'Membership': 'Membership',
            'JoinedDate': 'JoinedDate',
            'Completed': 'Completed',
            'Booked': 'Booked',
            'No Show': 'No Show',
            'Cancelled': 'Cancelled',
            'Late Cancelled': 'Late Cancelled',
            'Waitlist Cancelled': 'Waitlist Cancelled',
            'Waitlist Expired': 'Waitlist Expired',
            'Total Booking': 'Total Booking',
            'Date joined': 'Date joined',
            'Days since first joined': 'Days since first joined',
            'Days since last class': 'Days since last class',
            'Days since last appointment': 'Days since last appointment',
            'Days since outlet access': 'Days since outlet access',
            'Days since package purchase': 'Days since package purchase',
            'Days since membership purchase': 'Days since membership purchase',
            'Days since drop in purchase': 'Days since drop in purchase',
            'Days since course purchase': 'Days since course purchase',
            'Days since member': 'Days since member',
            'Days since non member': 'Days since non member',
            'Days since lost member': 'Days since lost member',
            'Total class completed': 'Total class completed',
            'Total appointment completed': 'Total appointment completed',
            'Total outlet access completed': 'Total outlet access completed',
            'Total courses completed': 'Total courses completed',
            'Total spending amount': 'Total spending amount',
            'profile_totalSpendedAmount': 'Profile Total Spent',
            'profile_totalBooking': 'Profile Total Bookings',
            'profile_totalAttendedClass': 'Profile Total Attended'
        }

        df_final = df_final.rename(columns=column_mapping)

        # Save the cleaned report
        df_final.to_csv(output_path, index=False)
        print(f"Cleaned profile report saved to {output_path}")

        # Display column info
        print(f"\nFinal columns ({len(df_final.columns)}):")
        for i, col in enumerate(df_final.columns, 1):
            print(f"{i:2d}. {col}")

        # Show sample data
        print(f"\nSample data for first customer:")
        if len(df_final) > 0:
            customer = df_final.iloc[0]
            for col in df_final.columns:
                value = customer[col]
                if pd.notna(value) and value != '':
                    print(f"  {col}: {value}")

        return df_final

    except Exception as e:
        print(f"Error cleaning profile report: {str(e)}")
        return None

if __name__ == "__main__":
    clean_profile_report()