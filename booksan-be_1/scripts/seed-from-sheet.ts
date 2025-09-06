import * as XLSX from 'xlsx';
import { PrismaClient, Sport } from '@prisma/client';
import { z } from 'zod';

// Configuration constants
const EXCEL_PATH = './scripts/data/geocoded_data.xlsx';
const OPEN_TIME = '06:00';
const CLOSE_TIME = '22:00';
const SLOT_MINUTES = 30;
const WEEKDAY_MASK = 127; // Mon-Sun (1+2+4+8+16+32+64)
const BATCH_SIZE = 1000;

// Price per hour in VND
const PRICES = {
  FOOTBALL: 500000,
  BADMINTON: 100000,
  TENNIS: 300000,
  BASKETBALL: 400000,
  VOLLEYBALL: 350000,
  TABLE_TENNIS: 150000,
  PICKLEBALL: 200000,
  FUTSAL: 450000,
  SQUASH: 250000,
  OTHER: 200000,
} as const;

// Zod schema for Excel data validation
const ExcelRowSchema = z.object({
  Name: z.string().min(1),
  Rating: z.coerce.number().optional(),
  Address: z.string().min(1),
  'Open Time': z.string().optional(),
  Type: z.string().min(1).optional(),
  Phone: z.string().min(1).optional(),
  'Source Image': z.string().optional(),
  'Extracted At': z.string().optional(),
  Latitude: z.coerce.number(),
  Longitude: z.coerce.number(),
  'Geocoded Address': z.string().optional(),
  'Geocoding Confidence': z.coerce.number().optional(),
  'Geocoded At': z.string().optional(),
  'Close Time': z.string().optional(),
});

type ExcelRow = z.infer<typeof ExcelRowSchema>;

// Phone normalization for Vietnam
function normalizePhone(phone: string): string {
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
// Supports Vietnamese and English sport names with comprehensive mapping
function mapSport(type: string): Sport {
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

  // Fallback for anything else (phức hợp, thể thao, golf, etc.)
  return Sport.OTHER;
}

// Get price by sport
function getPriceBySport(sport: Sport): number {
  return PRICES[sport];
}

// Read and validate Excel data
function readExcelData(): ExcelRow[] {
  console.log(`📖 Reading Excel file: ${EXCEL_PATH}`);

  try {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${rawData.length} rows in sheet "${sheetName}"`);

    // Validate and coerce data
    const validatedData: ExcelRow[] = [];
    const errors: string[] = [];

    rawData.forEach((row, index) => {
      try {
        const validated = ExcelRowSchema.parse(row);
        validatedData.push(validated);
      } catch (error) {
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    });

    if (errors.length > 0) {
      console.error('❌ Validation errors:');
      errors.forEach(error => console.error(`  ${error}`));
      process.exit(1);
    }

    return validatedData;
  } catch (error) {
    console.error(
      `❌ Error reading Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}

// Part 1: Duplicate check (sheet only)
function checkDuplicates(data: ExcelRow[]): ExcelRow[] {
  console.log('🔍 Checking for duplicates in sheet...');

  const phoneGroups = new Map<string, number[]>();

  // filter undefined phone
  data = data.filter(row => row.Phone);

  // filder undefined type
  data = data.filter(row => row.Type);

  data.forEach((row, index) => {
    const normalizedPhone = normalizePhone(row.Phone!);
    if (!phoneGroups.has(normalizedPhone)) {
      phoneGroups.set(normalizedPhone, []);
    }
    phoneGroups.get(normalizedPhone)!.push(index + 2); // +2 for Excel row numbers
  });

  const duplicates = Array.from(phoneGroups.entries()).filter(
    ([, indices]) => indices.length > 1,
  );

  if (duplicates.length > 0) {
    console.error('❌ Duplicate phones found in sheet:');
    console.error(`📊 Summary:`);
    console.error(`  Total rows: ${data.length}`);
    console.error(`  Unique phones: ${phoneGroups.size}`);
    console.error(`  Duplicated phones: ${duplicates.length}`);
    console.error(`  Duplicated phone numbers:`);

    duplicates.forEach(([phone, indices]) => {
      console.error(`    ${phone}: rows ${indices.join(', ')}`);
    });

    // remove all duplicates
    data = data.filter(
      row =>
        !duplicates.some(
          duplicate => duplicate[0] === normalizePhone(row.Phone!),
        ),
    );
  }

  return data;

  console.log(
    `✅ No duplicates found. ${data.length} rows, ${phoneGroups.size} unique phones.`,
  );
}

// Part 2: Seed data (idempotent, bulk)
async function seedData(data: ExcelRow[]): Promise<void> {
  const prisma = new PrismaClient();

  try {
    console.log('🌱 Starting database seeding...');

    // Phase 1: Owners (Users)
    await seedOwners(prisma, data);

    // Phase 2: Facilities
    await seedFacilities(prisma, data);

    // Phase 3: Open Hours
    await seedOpenHours(prisma, data);

    // Phase 4: Courts
    await seedCourts(prisma, data);

    // Phase 5: Pricing Rules
    await seedPricingRules(prisma, data);

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error(
      `❌ Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedOwners(
  prisma: PrismaClient,
  data: ExcelRow[],
): Promise<Map<string, string>> {
  const startTime = Date.now();
  console.log('👥 Seeding owners...');

  // Build unique owners by normalized phone
  const ownerMap = new Map<string, ExcelRow>();
  data.forEach(row => {
    const normalizedPhone = normalizePhone(row.Phone!);
    if (!ownerMap.has(normalizedPhone)) {
      ownerMap.set(normalizedPhone, row);
    }
  });

  const plannedCount = ownerMap.size;
  console.log(`  📋 Planning to insert ${plannedCount} owners`);

  // Check existing phones
  const existingPhones = await prisma.user.findMany({
    where: {
      phone: {
        in: Array.from(ownerMap.keys()),
      },
    },
    select: { phone: true },
  });

  const existingPhoneSet = new Set(existingPhones.map(u => u.phone));

  // Prepare data for insertion
  const ownersToInsert = Array.from(ownerMap.entries())
    .filter(([phone]) => !existingPhoneSet.has(phone))
    .map(([phone, row]) => ({
      fullname: row.Name,
      phone: phone,
      email: undefined, // No email column in your data
      password: 'temp_password_123', // Temporary password, should be updated
      role: 'OWNER' as const,
    }));

  // Bulk insert
  if (ownersToInsert.length > 0) {
    for (let i = 0; i < ownersToInsert.length; i += BATCH_SIZE) {
      const batch = ownersToInsert.slice(i, i + BATCH_SIZE);
      await prisma.user.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  // Fetch all owners to map phone -> userId
  const allOwners = await prisma.user.findMany({
    where: {
      phone: {
        in: Array.from(ownerMap.keys()),
      },
    },
    select: { id: true, phone: true },
  });

  const phoneToUserIdMap = new Map<string, string>();
  allOwners.forEach(owner => {
    phoneToUserIdMap.set(owner.phone!, owner.id);
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `  ✅ Inserted ${ownersToInsert.length} owners (${plannedCount} total), ${elapsed}ms`,
  );

  return phoneToUserIdMap;
}

async function seedFacilities(
  prisma: PrismaClient,
  data: ExcelRow[],
): Promise<Map<string, string>> {
  const startTime = Date.now();
  console.log('🏢 Seeding facilities...');

  // Get owner mapping
  const ownerMap = new Map<string, string>();
  const owners = await prisma.user.findMany({
    where: { role: 'OWNER' },
    select: { id: true, phone: true },
  });
  owners.forEach(owner => {
    if (owner.phone) {
      ownerMap.set(owner.phone, owner.id);
    }
  });

  // Build unique facilities by (ownerId, name)
  const facilityMap = new Map<string, ExcelRow>();
  data.forEach(row => {
    const normalizedPhone = normalizePhone(row.Phone!);
    const ownerId = ownerMap.get(normalizedPhone);
    if (ownerId) {
      const key = `${ownerId}:${row.Name}`;
      if (!facilityMap.has(key)) {
        facilityMap.set(key, row);
      }
    }
  });

  const plannedCount = facilityMap.size;
  console.log(`  📋 Planning to insert ${plannedCount} facilities`);

  // Check existing facilities
  const existingFacilities = await prisma.facility.findMany({
    select: { ownerId: true, name: true },
  });

  const existingFacilitySet = new Set(
    existingFacilities.map(f => `${f.ownerId}:${f.name}`),
  );

  // Prepare data for insertion
  const facilitiesToInsert = Array.from(facilityMap.entries())
    .filter(([key]) => !existingFacilitySet.has(key))
    .map(([key, row]) => {
      const [ownerId] = key.split(':');
      return {
        ownerId: ownerId,
        name: row.Name,
        desc: null, // No description column in your data
        address: row.Address,
        ward: null, // No ward column in your data
        city: null, // No city column in your data
        latitude: row.Latitude,
        longitude: row.Longitude,
        isPublished: false,
      };
    });

  // Bulk insert
  if (facilitiesToInsert.length > 0) {
    for (let i = 0; i < facilitiesToInsert.length; i += BATCH_SIZE) {
      const batch = facilitiesToInsert.slice(i, i + BATCH_SIZE);
      await prisma.facility.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  // Fetch all facilities to map (ownerId, name) -> facilityId
  const allFacilities = await prisma.facility.findMany({
    select: { id: true, ownerId: true, name: true },
  });

  const facilityKeyToIdMap = new Map<string, string>();
  allFacilities.forEach(facility => {
    const key = `${facility.ownerId}:${facility.name}`;
    facilityKeyToIdMap.set(key, facility.id);
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `  ✅ Inserted ${facilitiesToInsert.length} facilities (${plannedCount} total), ${elapsed}ms`,
  );

  return facilityKeyToIdMap;
}

async function seedOpenHours(
  prisma: PrismaClient,
  data: ExcelRow[],
): Promise<void> {
  const startTime = Date.now();
  console.log('🕐 Seeding open hours...');

  // Get facility mapping
  const facilityMap = new Map<string, string>();
  const facilities = await prisma.facility.findMany({
    select: { id: true, ownerId: true, name: true },
  });
  facilities.forEach(facility => {
    const key = `${facility.ownerId}:${facility.name}`;
    facilityMap.set(key, facility.id);
  });

  // Build open hours data
  const openHoursToInsert: Array<{
    facilityId: string;
    weekDay: number;
    openTime: string;
    closeTime: string;
  }> = [];

  for (const row of data) {
    const normalizedPhone = normalizePhone(row.Phone!);
    const ownerId = await getOwnerIdByPhone(prisma, normalizedPhone);
    if (ownerId) {
      const facilityKey = `${ownerId}:${row.Name}`;
      const facilityId = facilityMap.get(facilityKey);

      if (facilityId) {
        const openTime = row['Open Time'] || OPEN_TIME;
        const closeTime = row['Close Time'] || CLOSE_TIME;

        // Create 7 days of open hours
        for (let weekDay = 0; weekDay < 7; weekDay++) {
          openHoursToInsert.push({
            facilityId,
            weekDay,
            openTime,
            closeTime,
          });
        }
      }
    }
  }

  const plannedCount = openHoursToInsert.length;
  console.log(`  📋 Planning to insert ${plannedCount} open hours`);

  // Bulk insert
  if (openHoursToInsert.length > 0) {
    for (let i = 0; i < openHoursToInsert.length; i += BATCH_SIZE) {
      const batch = openHoursToInsert.slice(i, i + BATCH_SIZE);
      await prisma.facilityOpenHour.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  const elapsed = Date.now() - startTime;
  console.log(
    `  ✅ Inserted ${openHoursToInsert.length} open hours, ${elapsed}ms`,
  );
}

async function seedCourts(
  prisma: PrismaClient,
  data: ExcelRow[],
): Promise<Map<string, string>> {
  const startTime = Date.now();
  console.log('🏟️ Seeding courts...');

  // Get facility mapping
  const facilityMap = new Map<string, string>();
  const facilities = await prisma.facility.findMany({
    select: { id: true, ownerId: true, name: true },
  });
  facilities.forEach(facility => {
    const key = `${facility.ownerId}:${facility.name}`;
    facilityMap.set(key, facility.id);
  });

  // Build courts data
  const courtsToInsert: Array<{
    facilityId: string;
    name: string;
    sport: Sport;
    slotMinutes: number;
    isActive: boolean;
  }> = [];

  for (const row of data) {
    const normalizedPhone = normalizePhone(row.Phone!);
    const ownerId = await getOwnerIdByPhone(prisma, normalizedPhone);
    if (ownerId) {
      const facilityKey = `${ownerId}:${row.Name}`;
      const facilityId = facilityMap.get(facilityKey);

      if (facilityId) {
        const sport = mapSport(row.Type!);

        // Create 5 courts per facility
        for (let i = 1; i <= 5; i++) {
          courtsToInsert.push({
            facilityId,
            name: `Sân ${i}`,
            sport,
            slotMinutes: SLOT_MINUTES,
            isActive: true,
          });
        }
      }
    }
  }

  const plannedCount = courtsToInsert.length;
  console.log(`  📋 Planning to insert ${plannedCount} courts`);

  // Check existing courts
  const existingCourts = await prisma.court.findMany({
    select: { facilityId: true, name: true },
  });

  const existingCourtSet = new Set(
    existingCourts.map(c => `${c.facilityId}:${c.name}`),
  );

  // Filter out existing courts
  const newCourtsToInsert = courtsToInsert.filter(court => {
    const key = `${court.facilityId}:${court.name}`;
    return !existingCourtSet.has(key);
  });

  // Bulk insert
  if (newCourtsToInsert.length > 0) {
    for (let i = 0; i < newCourtsToInsert.length; i += BATCH_SIZE) {
      const batch = newCourtsToInsert.slice(i, i + BATCH_SIZE);
      await prisma.court.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  // Fetch all courts to map (facilityId, name) -> courtId
  const allCourts = await prisma.court.findMany({
    select: { id: true, facilityId: true, name: true },
  });

  const courtKeyToIdMap = new Map<string, string>();
  allCourts.forEach(court => {
    const key = `${court.facilityId}:${court.name}`;
    courtKeyToIdMap.set(key, court.id);
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `  ✅ Inserted ${newCourtsToInsert.length} courts (${plannedCount} total), ${elapsed}ms`,
  );

  return courtKeyToIdMap;
}

async function seedPricingRules(
  prisma: PrismaClient,
  data: ExcelRow[],
): Promise<void> {
  const startTime = Date.now();
  console.log('💰 Seeding pricing rules...');

  // Get court mapping with facility info
  const courtMap = new Map<string, { id: string; sport: Sport }>();
  const courts = await prisma.court.findMany({
    select: {
      id: true,
      facilityId: true,
      name: true,
      sport: true,
      facility: {
        select: { ownerId: true, name: true },
      },
    },
  });
  courts.forEach(court => {
    const key = `${court.facility.ownerId}:${court.facility.name}:${court.name}`;
    courtMap.set(key, { id: court.id, sport: court.sport });
  });

  // Build pricing rules data
  const pricingRulesToInsert: Array<{
    courtId: string;
    weekdayMask: number;
    startTime: string;
    endTime: string;
    pricePerSlot: number;
    slotMinutes: number;
  }> = [];

  for (const row of data) {
    const normalizedPhone = normalizePhone(row.Phone!);
    const ownerId = await getOwnerIdByPhone(prisma, normalizedPhone);
    if (ownerId) {
      const facilityKey = `${ownerId}:${row.Name}`;

      // Find courts for this facility
      const facilityCourts = Array.from(courtMap.entries())
        .filter(([key]) => key.startsWith(facilityKey + ':'))
        .map(([, court]) => court);

      for (const court of facilityCourts) {
        const openTime = row['Open Time'] || OPEN_TIME;
        const closeTime = row['Close Time'] || CLOSE_TIME;
        const pricePerHour = getPriceBySport(court.sport);
        const pricePerSlot = Math.round((pricePerHour * SLOT_MINUTES) / 60);

        pricingRulesToInsert.push({
          courtId: court.id,
          weekdayMask: WEEKDAY_MASK,
          startTime: openTime,
          endTime: closeTime,
          pricePerSlot,
          slotMinutes: SLOT_MINUTES,
        });
      }
    }
  }

  const plannedCount = pricingRulesToInsert.length;
  console.log(`  📋 Planning to insert ${plannedCount} pricing rules`);

  // Check existing pricing rules
  const existingRules = await prisma.pricingRule.findMany({
    select: {
      courtId: true,
      weekdayMask: true,
      startTime: true,
      endTime: true,
      slotMinutes: true,
    },
  });

  const existingRuleSet = new Set(
    existingRules.map(
      r =>
        `${r.courtId}:${r.weekdayMask}:${r.startTime}:${r.endTime}:${r.slotMinutes}`,
    ),
  );

  // Filter out existing rules
  const newRulesToInsert = pricingRulesToInsert.filter(rule => {
    const key = `${rule.courtId}:${rule.weekdayMask}:${rule.startTime}:${rule.endTime}:${rule.slotMinutes}`;
    return !existingRuleSet.has(key);
  });

  // Bulk insert
  if (newRulesToInsert.length > 0) {
    for (let i = 0; i < newRulesToInsert.length; i += BATCH_SIZE) {
      const batch = newRulesToInsert.slice(i, i + BATCH_SIZE);
      await prisma.pricingRule.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  }

  const elapsed = Date.now() - startTime;
  console.log(
    `  ✅ Inserted ${newRulesToInsert.length} pricing rules (${plannedCount} total), ${elapsed}ms`,
  );
}

// Helper function to get owner ID by phone
async function getOwnerIdByPhone(
  prisma: PrismaClient,
  normalizedPhone: string,
): Promise<string | null> {
  const owner = await prisma.user.findFirst({
    where: { phone: normalizedPhone, role: 'OWNER' },
    select: { id: true },
  });
  return owner?.id || null;
}

// Main execution
async function main(): Promise<void> {
  console.log('🚀 Starting Excel to Database seeding process...');

  // Part 1: Read and validate data
  const data = readExcelData();

  // Part 2: Check for duplicates
  const dataWithoutDuplicates = checkDuplicates(data);

  // Part 3: Seed data
  await seedData(dataWithoutDuplicates);

  console.log('🎉 Process completed successfully!');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error(
      '❌ Fatal error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    process.exit(1);
  });
}
