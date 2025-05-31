# OffersHub Data Generator

This script generates random test data for the OffersHub database, respecting all foreign key constraints between tables.

## Prerequisites

- Python 3.8+
- PostgreSQL database with the OffersHub schema already created
- Required Python packages: `faker`, `psycopg2-binary`

## Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Make sure your PostgreSQL database is running and has the OffersHub schema created (using the `database-init/init.sql` script).

## Usage

Run the script with default parameters:

```bash
python data_generator.py
```

Or customize the amount of data to generate:

```bash
python data_generator.py --users 20 --tenants 6 --offers 50 --customers 200
```

### Fix Schema Issues

If you encounter schema issues (like duplicate columns), use the `--fix-schema` flag:

```bash
python data_generator.py --fix-schema
```

This will attempt to fix common schema issues before generating data.

### Available Options

- `--users`: Number of users to generate (default: 10)
- `--tenants`: Number of tenants to generate (default: 5)
- `--roles`: Number of user tenant roles to generate (default: 20)
- `--offers`: Number of offers to generate (default: 30)
- `--audit-logs`: Number of offer audit logs to generate (default: 50)
- `--customers`: Number of customers to generate (default: 100)
- `--campaigns`: Number of campaigns to generate (default: 15)
- `--campaign-customers`: Number of campaign customers to generate (default: 200)
- `--fix-schema`: Attempt to fix schema issues before generating data

## Database Configuration

By default, the script connects to:
- Database: `offer_management`
- User: `postgres`
- Password: `postgres`
- Host: `localhost`
- Port: `5432`

To modify these settings, edit the `DB_PARAMS` dictionary in the script.

## Generated Data

The script generates data in the following order to respect foreign key constraints:

1. Users (including one super admin)
2. Tenants
3. User-tenant roles
4. Offers
5. Offer audit logs
6. Customers
7. Campaigns
8. Campaign customers

Each entity is populated with realistic random data using the Faker library.

## Troubleshooting

### Schema Issues

The script includes automatic fixes for common schema issues:

1. **Duplicate offer_description column**: The script will attempt to fix this by dropping and recreating the column.
2. **TINYTEXT data type**: PostgreSQL doesn't support TINYTEXT, so the script will convert it to TEXT.

If you still encounter issues, try running with the `--fix-schema` flag. 