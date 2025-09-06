# 📊 Excel to Database Seeding Scripts

This directory contains scripts for seeding the database from Excel files.

## 🚀 Quick Start

### 1. Create Sample Data
```bash
# Create a sample Excel file for testing
npx ts-node scripts/create-sample-excel.ts
```

### 2. Run Seeding Script
```bash
# Seed database from Excel file
pnpm run db:seed:excel
```

## 📋 Excel File Format

### Required Columns
- `Name` - Name of the sports facility
- `Phone` - Phone number (will be normalized)
- `Address` - Full address
- `Latitude` - GPS latitude coordinate
- `Longitude` - GPS longitude coordinate
- `Type` - Sport type (see mapping below)

### Optional Columns
- `Rating` - Facility rating
- `Open Time` - Opening time (default: 06:00)
- `Close Time` - Closing time (default: 22:00)
- `Confidence` - Data confidence score
- `Source Image` - Source image reference
- `Extracted At` - Data extraction timestamp
- `Geocoded Address` - Geocoded address
- `Geocoding Confidence` - Geocoding confidence score
- `Geocoded At` - Geocoding timestamp

### Sport Mapping
The script automatically maps sport names to database enums:

| Excel Value | Database Enum | Price/Hour (VND) |
|-------------|---------------|------------------|
| `pickleball`, `pickleballs` | `PICKLEBALL` | 200,000 |
| `cầu lông`, `cau long`, `badminton` | `BADMINTON` | 100,000 |
| `bóng đá`, `bong da`, `football`, `soccer` | `FOOTBALL` | 500,000 |
| `tennis` | `TENNIS` | 300,000 |
| `bóng rổ`, `bong ro`, `basketball`, `3x3 basketball` | `BASKETBALL` | 400,000 |
| `bóng chuyền`, `bong chuyen`, `b.chuyển`, `b.chuyen`, `volleyball` | `VOLLEYBALL` | 350,000 |
| `bóng bàn`, `bong ban`, `table tennis` | `TABLE_TENNIS` | 150,000 |
| `futsal` | `FUTSAL` | 450,000 |
| `squash` | `SQUASH` | 250,000 |
| Any other value (phức hợp, thể thao, golf, etc.) | `OTHER` | 200,000 |

## 🔧 Configuration

Edit the constants at the top of `seed-from-sheet.ts`:

```typescript
const EXCEL_PATH = './data/geocoded_data.xlsx';
const OPEN_TIME = '06:00';
const CLOSE_TIME = '22:00';
const SLOT_MINUTES = 30;
const WEEKDAY_MASK = 127; // Mon-Sun (1+2+4+8+16+32+64)
const BATCH_SIZE = 1000;

// Price per hour in VND
const PRICES = {
  FOOTBALL: 500000,
  BADMINTON: 100000,
  OTHER: 200000,
} as const;
```

## 📱 Phone Number Normalization

The script automatically normalizes Vietnamese phone numbers:

1. **Keep digits only** - Removes all non-digit characters
2. **Convert 84 prefix** - `84xxxxxxxxx` → `0xxxxxxxxx`
3. **Add leading zero** - Ensures 10-11 digit numbers start with `0`

Examples:
- `0901234567` → `0901234567` (unchanged)
- `84123456789` → `0123456789`
- `1234567890` → `0123456789`

## 🏗️ Database Schema

The script creates the following entities:

### 1. Users (Owners)
- **Unique constraint**: `phone`
- **Role**: `OWNER`
- **Password**: Temporary (`temp_password_123`)

### 2. Facilities
- **Unique constraint**: `[ownerId, name]`
- **Status**: `isPublished = false`
- **Location**: GPS coordinates from Excel

### 3. Open Hours
- **Unique constraint**: `[facilityId, weekDay]`
- **Days**: 7 days (0-6, Monday-Sunday)
- **Times**: From Excel or defaults

### 4. Courts
- **Unique constraint**: `[facilityId, name]`
- **Count**: 5 courts per facility (`Sân 1` to `Sân 5`)
- **Sport**: Mapped from Excel
- **Slot duration**: 30 minutes

### 5. Pricing Rules
- **Unique constraint**: `[courtId, weekdayMask, startTime, endTime, slotMinutes]`
- **Price calculation**: `(pricePerHour * slotMinutes) / 60`
- **Weekday mask**: 127 (all days)

## 🔄 Idempotent Behavior

The script is designed to be **idempotent** - running it multiple times produces the same result:

- **Duplicate detection**: Stops if duplicate phones found in Excel
- **Skip duplicates**: Uses `skipDuplicates: true` for all bulk inserts
- **Unique constraints**: Database prevents duplicate records
- **Re-query mapping**: Fetches existing records to build relationships

## 📊 Performance Features

- **Bulk operations**: Uses `createMany` with batching
- **Batch size**: Configurable (default: 1000 records)
- **Single queries**: Fetches all existing records in one query per entity
- **Memory efficient**: Processes data in batches

## 🚨 Error Handling

### Duplicate Phones in Excel
```
❌ Duplicate phones found in sheet:
📊 Summary:
  Total rows: 100
  Unique phones: 95
  Duplicated phones: 5
  Duplicated phone numbers:
    0901234567: rows 10, 25, 67
```

### Validation Errors
```
❌ Validation errors:
  Row 5: email must be a valid email
  Row 12: latitude must be a number
```

## 📈 Output Example

```
🚀 Starting Excel to Database seeding process...
📖 Reading Excel file: ./data/geocoded_data.xlsx
📊 Found 100 rows in sheet "Sheet1"
🔍 Checking for duplicates in sheet...
✅ No duplicates found. 100 rows, 100 unique phones.
🌱 Starting database seeding...
👥 Seeding owners...
  📋 Planning to insert 100 owners
  ✅ Inserted 100 owners (100 total), 250ms
🏢 Seeding facilities...
  📋 Planning to insert 100 facilities
  ✅ Inserted 100 facilities (100 total), 45ms
🕐 Seeding open hours...
  📋 Planning to insert 700 open hours
  ✅ Inserted 700 open hours, 120ms
🏟️ Seeding courts...
  📋 Planning to insert 500 courts
  ✅ Inserted 500 courts (500 total), 80ms
💰 Seeding pricing rules...
  📋 Planning to insert 500 pricing rules
  ✅ Inserted 500 pricing rules (500 total), 95ms
✅ Seeding completed successfully!
🎉 Process completed successfully!
```

## 🛠️ Troubleshooting

### Common Issues

1. **Excel file not found**
   ```
   ❌ Error reading Excel file: ENOENT: no such file or directory
   ```
   **Solution**: Ensure `./data/geocoded_data.xlsx` exists

2. **Invalid data format**
   ```
   ❌ Validation errors:
     Row 3: latitude must be a number
   ```
   **Solution**: Check Excel data types and formatting

3. **Database connection issues**
   ```
   ❌ Seeding failed: connect ECONNREFUSED
   ```
   **Solution**: Ensure database is running and connection string is correct

### Debug Mode

Add debug logging by uncommenting console.log statements in the script.

## 📝 File Structure

```
scripts/
├── seed-from-sheet.ts      # Main seeding script
├── create-sample-excel.ts  # Sample data generator
└── README.md              # This documentation

data/
└── geocoded_data.xlsx     # Excel input file
```

## 🔐 Security Notes

- **Temporary passwords**: All owners get `temp_password_123`
- **No validation**: Script doesn't validate phone numbers
- **Public data**: Assumes Excel data is already validated
- **Database access**: Requires full database write permissions

## 🎯 Best Practices

1. **Backup database** before running on production data
2. **Validate Excel data** before seeding
3. **Test with sample data** first
4. **Monitor performance** with large datasets
5. **Update passwords** after seeding
6. **Review generated data** in database

## 📞 Support

For issues or questions:
1. Check the console output for error messages
2. Verify Excel file format matches requirements
3. Ensure database schema is up to date
4. Check unique constraints aren't violated
