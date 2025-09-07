import * as XLSX from 'xlsx';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'Booksan@2024'; // Default password for users

interface GeocodedDataRow {
  Name: string;
  Phone?: string;
  Address: string;
  Type: string;
  Rating?: number;
  'Open Time'?: string;
  'Close Time'?: string;
  Latitude: number;
  Longitude: number;
  [key: string]: any;
}

async function updateUsersFromGeocodedData() {
  try {
    console.log('🔍 Reading geocoded data...');

    const filePath = path.join(__dirname, 'data', 'geocoded_data.xlsx');
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as GeocodedDataRow[];

    console.log(`📊 Found ${data.length} rows in the Excel file`);

    // Extract unique phone numbers (filter out empty/null values)
    const phoneNumbers = [
      ...new Set(
        data
          .map(row => row.Phone)
          .filter(phone => phone && phone.trim() !== '')
          .map(phone => phone!.trim()),
      ),
    ];

    console.log(`📞 Found ${phoneNumbers.length} unique phone numbers`);

    if (phoneNumbers.length === 0) {
      console.log('❌ No phone numbers found in the data');
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    console.log('🔐 Default password hashed');

    let updatedCount = 0;
    let notFoundCount = 0;

    console.log('🔄 Processing users...');

    for (const phone of phoneNumbers) {
      try {
        // Find users with this phone number (regardless of role)
        const users = await prisma.user.findMany({
          where: { phone },
          select: { id: true, fullname: true, phone: true, role: true },
        });

        if (users.length > 0) {
          // Update password for all users with this phone number
          await prisma.user.updateMany({
            where: { phone },
            data: { password: hashedPassword },
          });

          console.log(
            `✅ Updated ${users.length} user(s) with phone ${phone}:`,
          );
          users.forEach(user => {
            console.log(`   - ${user.fullname} (${user.role})`);
          });
          updatedCount += users.length;
        } else {
          notFoundCount++;
          console.log(`⚠️  No user found with phone ${phone}`);
        }
      } catch (error) {
        console.error(`❌ Error processing phone ${phone}:`, error);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updatedCount} users`);
    console.log(`   ⚠️  Not found: ${notFoundCount} phone numbers`);
    console.log(`   🔐 Default password: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateUsersFromGeocodedData();
