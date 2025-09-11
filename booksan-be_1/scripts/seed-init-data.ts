import * as XLSX from 'xlsx';
import * as path from 'path';
import { PrismaClient, Sport } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration constants
const EXCEL_PATH = './scripts/data/geocoded_data_with_slugs.xlsx';
const DEFAULT_PASSWORD = 'Booksan@2025'; // Default password for users
const OPEN_TIME = '06:00';
const CLOSE_TIME = '22:00';
const SLOT_MINUTES = 30;

// Interface for Excel data structure
interface ExcelDataRow {
  Name: string;
  Phone?: string;
  Address: string;
  Type?: string;
  Rating?: number;
  'Open Time'?: string;
  'Close Time'?: string;
  Latitude: number;
  Longitude: number;
  Slug?: string;
  [key: string]: any;
}

// Phone normalization for Vietnam
function normalizePhone(phone: string): string {
  if (!phone) return '';

  // Keep digits only
  const digits = phone.replace(/\D/g, '');

  // If starts with 84, convert to 0 + remaining
  if (digits.startsWith('84')) {
    return '0' + digits.slice(2);
  }

  // Ensure leading 0 for 10-11 digits
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('0')) {
    return '0' + digits;
  }

  return digits;
}

// Map sport string to enum
function mapSport(type: string): Sport {
  if (!type) return Sport.OTHER;

  const sportType = type.toLowerCase().trim();

  // Pickleball
  if (['pickleball', 'pickleballs'].includes(sportType)) {
    return Sport.PICKLEBALL;
  }

  // Badminton
  if (['cầu lông', 'cau long', 'badminton'].includes(sportType)) {
    return Sport.BADMINTON;
  }

  // Football
  if (['bóng đá', 'bong da', 'football', 'soccer'].includes(sportType)) {
    return Sport.FOOTBALL;
  }

  // Tennis
  if (['tennis'].includes(sportType)) {
    return Sport.TENNIS;
  }

  // Basketball
  if (
    ['bóng rổ', 'bong ro', 'basketball', '3x3 basketball'].includes(sportType)
  ) {
    return Sport.BASKETBALL;
  }

  // Volleyball
  if (
    [
      'bóng chuyền',
      'bong chuyen',
      'b.chuyển',
      'b.chuyen',
      'volleyball',
    ].includes(sportType)
  ) {
    return Sport.VOLLEYBALL;
  }

  // Table Tennis
  if (['bóng bàn', 'bong ban', 'table tennis'].includes(sportType)) {
    return Sport.TABLE_TENNIS;
  }

  // Futsal
  if (['futsal'].includes(sportType)) {
    return Sport.FUTSAL;
  }

  // Squash
  if (['squash'].includes(sportType)) {
    return Sport.SQUASH;
  }

  // Fallback for anything else
  return Sport.OTHER;
}

// Generate slug from name if not provided
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Read and validate Excel data
function readExcelData(): ExcelDataRow[] {
  console.log(`📖 Reading Excel file: ${EXCEL_PATH}`);

  try {
    const filePath = path.join(
      __dirname,
      'data',
      'geocoded_data_with_slugs.xlsx',
    );
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${rawData.length} rows in sheet "${sheetName}"`);

    // Filter out rows without required data
    const validData = rawData.filter((row): row is ExcelDataRow => {
      return (
        typeof row === 'object' &&
        row !== null &&
        'Name' in row &&
        'Address' in row &&
        'Phone' in row &&
        'Latitude' in row &&
        'Longitude' in row &&
        typeof (row as ExcelDataRow).Name === 'string' &&
        typeof (row as ExcelDataRow).Address === 'string' &&
        typeof (row as ExcelDataRow).Phone === 'string' &&
        typeof (row as ExcelDataRow).Latitude === 'number' &&
        typeof (row as ExcelDataRow).Longitude === 'number'
      );
    });

    console.log(`✅ ${validData.length} valid rows after filtering`);
    return validData;
  } catch (error) {
    console.error(
      `❌ Error reading Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}

// Check for duplicates and remove them
function removeDuplicates(data: ExcelDataRow[]): ExcelDataRow[] {
  console.log('🔍 Checking for duplicates...');

  const phoneGroups = new Map<string, ExcelDataRow[]>();

  data.forEach(row => {
    const normalizedPhone = normalizePhone(row.Phone!);
    if (!phoneGroups.has(normalizedPhone)) {
      phoneGroups.set(normalizedPhone, []);
    }
    phoneGroups.get(normalizedPhone)!.push(row);
  });

  const duplicates = Array.from(phoneGroups.entries()).filter(
    ([, rows]) => rows.length > 1,
  );

  if (duplicates.length > 0) {
    console.log(
      `⚠️  Found ${duplicates.length} duplicate phone numbers. Keeping first occurrence of each.`,
    );
    duplicates.forEach(([phone, rows]) => {
      console.log(`   📞 ${phone}: ${rows.length} occurrences`);
    });
  }

  // Keep only the first occurrence of each phone number
  const uniqueData = Array.from(phoneGroups.values()).map(rows => rows[0]);

  console.log(`✅ ${uniqueData.length} unique rows after deduplication`);
  return uniqueData;
}

// Create users for facility owners
async function createUsers(data: ExcelDataRow[]): Promise<Map<string, string>> {
  console.log('👥 Creating facility owners...');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const phoneToUserIdMap = new Map<string, string>();

  // Get existing users to avoid duplicates
  const existingUsers = await prisma.user.findMany({
    where: { role: 'OWNER' },
    select: { id: true, phone: true },
  });

  const existingPhoneSet = new Set(
    existingUsers.map(u => u.phone).filter(Boolean),
  );

  // Prepare users to create
  const usersToCreate = data
    .filter(row => {
      const normalizedPhone = normalizePhone(row.Phone!);
      return normalizedPhone && !existingPhoneSet.has(normalizedPhone);
    })
    .map(row => ({
      fullname: row.Name,
      phone: normalizePhone(row.Phone!),
      password: hashedPassword,
      role: 'OWNER' as const,
    }));

  let createdCount = 0;

  // Create users in batches
  if (usersToCreate.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < usersToCreate.length; i += batchSize) {
      const batch = usersToCreate.slice(i, i + batchSize);
      await prisma.user.createMany({
        data: batch,
        skipDuplicates: true,
      });
      createdCount += batch.length;
    }
  }

  // Get all users (existing + newly created) to build the mapping
  const allOwners = await prisma.user.findMany({
    where: { role: 'OWNER' },
    select: { id: true, phone: true },
  });

  allOwners.forEach(owner => {
    if (owner.phone) {
      phoneToUserIdMap.set(owner.phone, owner.id);
    }
  });

  console.log(
    `✅ Created ${createdCount} new users, total ${allOwners.length} owners available`,
  );
  return phoneToUserIdMap;
}

// Create facilities
async function createFacilities(
  data: ExcelDataRow[],
  phoneToUserIdMap: Map<string, string>,
): Promise<Map<string, string>> {
  console.log('🏢 Creating facilities...');

  const facilityNameToIdMap = new Map<string, string>();

  // Get existing facilities to avoid duplicates
  const existingFacilities = await prisma.facility.findMany({
    select: { id: true, ownerId: true, name: true, slug: true },
  });

  const existingFacilitySet = new Set(
    existingFacilities.map(f => `${f.ownerId}:${f.name}`),
  );

  // Prepare facilities to create
  const facilitiesToCreate = data
    .filter(row => {
      const normalizedPhone = normalizePhone(row.Phone!);
      const ownerId = phoneToUserIdMap.get(normalizedPhone);
      if (!ownerId) return false;

      const key = `${ownerId}:${row.Name}`;
      return !existingFacilitySet.has(key);
    })
    .map(row => {
      const normalizedPhone = normalizePhone(row.Phone!);
      const ownerId = phoneToUserIdMap.get(normalizedPhone)!;
      const slug = row.Slug || generateSlug(row.Name);

      return {
        ownerId,
        name: row.Name,
        slug,
        address: row.Address,
        latitude: row.Latitude,
        longitude: row.Longitude,
        phone: normalizedPhone,
        isPublished: true,
      };
    });

  let createdCount = 0;

  // Create facilities one by one to handle slug uniqueness
  for (const facilityData of facilitiesToCreate) {
    try {
      const created = await prisma.facility.create({
        data: facilityData,
      });
      facilityNameToIdMap.set(
        `${facilityData.ownerId}:${facilityData.name}`,
        created.id,
      );
      createdCount++;
    } catch (error) {
      console.error(
        `❌ Failed to create facility ${facilityData.name}:`,
        error,
      );
      // Try with a modified slug
      try {
        const modifiedSlug = `${facilityData.slug}-${Date.now()}`;
        const created = await prisma.facility.create({
          data: { ...facilityData, slug: modifiedSlug },
        });
        facilityNameToIdMap.set(
          `${facilityData.ownerId}:${facilityData.name}`,
          created.id,
        );
        createdCount++;
      } catch {
        console.error(
          `❌ Failed to create facility ${facilityData.name} even with modified slug`,
        );
      }
    }
  }

  // Get all facilities to build complete mapping
  const allFacilities = await prisma.facility.findMany({
    select: { id: true, ownerId: true, name: true },
  });

  allFacilities.forEach(facility => {
    const key = `${facility.ownerId}:${facility.name}`;
    facilityNameToIdMap.set(key, facility.id);
  });

  console.log(
    `✅ Created ${createdCount} new facilities, total ${allFacilities.length} facilities available`,
  );
  return facilityNameToIdMap;
}

// Create facility open hours
async function createFacilityOpenHours(
  data: ExcelDataRow[],
  phoneToUserIdMap: Map<string, string>,
  facilityNameToIdMap: Map<string, string>,
): Promise<void> {
  console.log('🕐 Creating facility open hours...');

  const openHoursToCreate: Array<{
    facilityId: string;
    weekDay: number;
    openTime: string;
    closeTime: string;
  }> = [];

  for (const row of data) {
    const normalizedPhone = normalizePhone(row.Phone!);
    const ownerId = phoneToUserIdMap.get(normalizedPhone);

    if (ownerId) {
      const facilityKey = `${ownerId}:${row.Name}`;
      const facilityId = facilityNameToIdMap.get(facilityKey);

      if (facilityId) {
        const openTime = row['Open Time'] || OPEN_TIME;
        const closeTime = row['Close Time'] || CLOSE_TIME;

        // Create open hours for all 7 days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        for (let weekDay = 0; weekDay < 7; weekDay++) {
          openHoursToCreate.push({
            facilityId,
            weekDay,
            openTime,
            closeTime,
          });
        }
      }
    }
  }

  // Remove existing open hours for these facilities to avoid duplicates
  const facilityIds = [...new Set(openHoursToCreate.map(oh => oh.facilityId))];
  await prisma.facilityOpenHour.deleteMany({
    where: { facilityId: { in: facilityIds } },
  });

  // Create open hours in batches
  if (openHoursToCreate.length > 0) {
    const batchSize = 500;
    let createdCount = 0;

    for (let i = 0; i < openHoursToCreate.length; i += batchSize) {
      const batch = openHoursToCreate.slice(i, i + batchSize);
      await prisma.facilityOpenHour.createMany({
        data: batch,
        skipDuplicates: true,
      });
      createdCount += batch.length;
    }

    console.log(`✅ Created ${createdCount} open hour records`);
  }
}

// Create courts for each facility
async function createCourts(
  data: ExcelDataRow[],
  phoneToUserIdMap: Map<string, string>,
  facilityNameToIdMap: Map<string, string>,
): Promise<void> {
  console.log('🏟️ Creating courts...');

  const courtsToCreate: Array<{
    facilityId: string;
    name: string;
    sport: Sport;
    slotMinutes: number;
    isActive: boolean;
  }> = [];

  for (const row of data) {
    const normalizedPhone = normalizePhone(row.Phone!);
    const ownerId = phoneToUserIdMap.get(normalizedPhone);

    if (ownerId) {
      const facilityKey = `${ownerId}:${row.Name}`;
      const facilityId = facilityNameToIdMap.get(facilityKey);

      if (facilityId) {
        const sport = mapSport(row.Type || '');

        // Create 1 court per facility as requested
        courtsToCreate.push({
          facilityId,
          name: 'Sân 1',
          sport,
          slotMinutes: SLOT_MINUTES,
          isActive: true,
        });
      }
    }
  }

  // Check existing courts to avoid duplicates
  const existingCourts = await prisma.court.findMany({
    select: { facilityId: true, name: true },
  });

  const existingCourtSet = new Set(
    existingCourts.map(c => `${c.facilityId}:${c.name}`),
  );

  // Filter out existing courts
  const newCourtsToCreate = courtsToCreate.filter(court => {
    const key = `${court.facilityId}:${court.name}`;
    return !existingCourtSet.has(key);
  });

  // Create courts in batches
  if (newCourtsToCreate.length > 0) {
    const batchSize = 100;
    let createdCount = 0;

    for (let i = 0; i < newCourtsToCreate.length; i += batchSize) {
      const batch = newCourtsToCreate.slice(i, i + batchSize);
      await prisma.court.createMany({
        data: batch,
        skipDuplicates: true,
      });
      createdCount += batch.length;
    }

    console.log(`✅ Created ${createdCount} courts`);
  } else {
    console.log(`✅ No new courts to create`);
  }
}

// Main seeding function
async function seedInitialData(): Promise<void> {
  try {
    console.log('🚀 Starting initial data seeding from Excel file...');
    console.log(`🔐 Default password for all users: ${DEFAULT_PASSWORD}`);

    // Step 1: Read and validate Excel data
    const rawData = readExcelData();

    // Step 2: Remove duplicates
    const uniqueData = removeDuplicates(rawData);

    if (uniqueData.length === 0) {
      console.log('❌ No valid data found in Excel file');
      return;
    }

    // Step 3: Create users (facility owners)
    const phoneToUserIdMap = await createUsers(uniqueData);

    // Step 4: Create facilities
    const facilityNameToIdMap = await createFacilities(
      uniqueData,
      phoneToUserIdMap,
    );

    // Step 5: Create facility open hours
    await createFacilityOpenHours(
      uniqueData,
      phoneToUserIdMap,
      facilityNameToIdMap,
    );

    // Step 6: Create courts
    await createCourts(uniqueData, phoneToUserIdMap, facilityNameToIdMap);

    console.log('🎉 Initial data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${phoneToUserIdMap.size} facility owners`);
    console.log(`   🏢 Facilities: ${facilityNameToIdMap.size} facilities`);
    console.log(`   🕐 Open hours: 7 days per facility`);
    console.log(`   🏟️ Courts: 1 court per facility`);
    console.log(`   🔐 Password: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error(
      '❌ Seeding failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

// Run the script
if (require.main === module) {
  void seedInitialData()
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
}

export { seedInitialData };
