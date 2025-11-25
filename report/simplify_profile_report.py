import pandas as pd

def simplify_profile_report():
    # Read the cleaned profile report
    input_path = 'consolidated_customer_profiles_clean.csv'
    output_path = 'simplified_customer_profiles.csv'

    try:
        df = pd.read_csv(input_path)
        print(f"Loaded {len(df)} records from cleaned profile report")

        # Columns to remove
        columns_to_remove = [
            'Membership', 'Booked', 'No Show', 'Late Cancelled',
            'Waitlist Cancelled', 'Waitlist Expired', 'Total Booking',
            'Days since first joined', 'Days since last appointment',
            'Days since outlet access', 'Days since drop in purchase',
            'Days since course purchase', 'Days since member',
            'Days since non member', 'Days since lost member',
            'Total class completed', 'Total appointment completed',
            'Total outlet access completed', 'Total courses completed',
            'Profile Total Bookings', 'Total spending amount'
        ]

        # Remove specified columns
        df_simplified = df.drop(columns=columns_to_remove, errors='ignore')
        print(f"Removed {len(columns_to_remove)} columns")

        # Calculate Average Revenue = Profile Total Spent / Profile Total Attended
        # Handle division by zero - if no attended classes, average revenue is 0
        df_simplified['Average Revenue'] = df_simplified.apply(
            lambda row: row['Profile Total Spent'] / row['Profile Total Attended']
            if row['Profile Total Attended'] > 0 else 0, axis=1
        )

        # Define final column order
        final_columns = [
            'CustomerName', 'MobileCode', 'Mobile', 'Email', 'DateOfBirth',
            'JoinedDate', 'Completed', 'Cancelled', 'Date joined',
            'Days since last class', 'Days since package purchase',
            'Days since membership purchase', 'Profile Total Spent',
            'Profile Total Attended', 'Average Revenue'
        ]

        # Select only existing columns in the right order
        existing_columns = [col for col in final_columns if col in df_simplified.columns]
        df_final = df_simplified[existing_columns].copy()

        # Format Average Revenue to 2 decimal places
        df_final['Average Revenue'] = df_final['Average Revenue'].round(2)

        # Save the simplified report
        df_final.to_csv(output_path, index=False)
        print(f"Simplified profile report saved to {output_path}")

        # Display column info
        print(f"\nFinal columns ({len(df_final.columns)}):")
        for i, col in enumerate(df_final.columns, 1):
            print(f"{i:2d}. {col}")

        # Show sample data with calculations
        print(f"\nSample data with Average Revenue calculation:")
        print("=" * 80)
        if len(df_final) > 0:
            for idx, row in df_final.iterrows():
                print(f"\nCustomer {idx + 1}: {row['CustomerName']}")
                print(f"  Profile Total Spent: {row['Profile Total Spent']:,.2f}")
                print(f"  Profile Total Attended: {row['Profile Total Attended']}")
                print(f"  Average Revenue: {row['Average Revenue']:,.2f}")
                if idx >= 2:  # Show only first 3 as examples
                    break

        # Summary statistics
        print(f"\n" + "=" * 80)
        print("SUMMARY STATISTICS")
        print("=" * 80)
        print(f"Total Customers: {len(df_final)}")
        print(f"Total Revenue: {df_final['Profile Total Spent'].sum():,.2f}")
        print(f"Total Classes Attended: {df_final['Profile Total Attended'].sum()}")
        print(f"Overall Average Revenue per Class: {(df_final['Profile Total Spent'].sum() / df_final['Profile Total Attended'].sum()):.2f}")
        print(f"Average Revenue per Customer: {df_final['Average Revenue'].mean():.2f}")
        print(f"Highest Revenue Customer: {df_final.loc[df_final['Profile Total Spent'].idxmax(), 'CustomerName']}")
        print(f"Highest Revenue per Class: {df_final.loc[df_final['Average Revenue'].idxmax(), 'CustomerName']}")

        return df_final

    except Exception as e:
        print(f"Error simplifying profile report: {str(e)}")
        return None

if __name__ == "__main__":
    simplify_profile_report()