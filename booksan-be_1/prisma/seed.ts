import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@booksan.com' },
    update: {},
    create: {
      email: 'admin@booksan.com',
      fullname: 'Admin User',
      password: crypto.createHash('sha256').update('admin123').digest('hex'),
      role: 'ADMIN',
    },
  });

  // Create facility owner
  const facilityOwner = await prisma.user.upsert({
    where: { email: 'owner@facility.com' },
    update: {},
    create: {
      email: 'owner@facility.com',
      fullname: 'Facility Owner',
      password: crypto.createHash('sha256').update('owner123').digest('hex'),
      role: 'OWNER',
    },
  });

  // Create regular player
  const regularPlayer = await prisma.user.upsert({
    where: { email: 'player@example.com' },
    update: {},
    create: {
      email: 'player@example.com',
      fullname: 'Regular Player',
      password: crypto.createHash('sha256').update('player123').digest('hex'),
      role: 'PLAYER',
    },
  });

  // Create sample facility
  const facility = await prisma.facility.upsert({
    where: { id: 'facility-1' },
    update: {},
    create: {
      id: 'facility-1',
      name: 'Sports Complex A',
      desc: 'A modern sports complex with multiple courts',
      phone: '+84 123 456 789',
      address: '123 Sports Street, District 1',
      ward: 'District 1',
      city: 'Ho Chi Minh City',
      isPublished: true,
      latitude: 10.7769,
      longitude: 106.7009,
      ownerId: facilityOwner.id,
    },
  });

  // Create sample courts
  const tennisCourt = await prisma.court.upsert({
    where: { id: 'court-1' },
    update: {},
    create: {
      id: 'court-1',
      name: 'Tennis Court 1',
      sport: 'TENNIS',
      surface: 'HARD_COURT',
      indoor: false,
      notes: 'Professional tennis court with proper lighting',
      slotMinutes: 60,
      isActive: true,
      facilityId: facility.id,
    },
  });

  const badmintonCourt = await prisma.court.upsert({
    where: { id: 'court-2' },
    update: {},
    create: {
      id: 'court-2',
      name: 'Badminton Court 1',
      sport: 'BADMINTON',
      surface: 'WOODEN',
      indoor: true,
      notes: 'Indoor badminton court with air conditioning',
      slotMinutes: 60,
      isActive: true,
      facilityId: facility.id,
    },
  });

  // Create sample booking
  const booking = await prisma.booking.upsert({
    where: { id: 'booking-1' },
    update: {},
    create: {
      id: 'booking-1',
      playerId: regularPlayer.id,
      facilityId: facility.id,
      courtId: tennisCourt.id,
      status: 'CONFIRMED',
      startAt: '2024-12-20T09:00:00Z',
      endAt: '2024-12-20T10:00:00Z',
      slotMinutes: 60,
      unitPrice: 150000, // 150k VND
      totalPrice: 150000,
      isRecurrence: false,
    },
  });

  // Create sample booking slot
  const bookingSlot = await prisma.bookingSlot.upsert({
    where: { id: 'slot-1' },
    update: {},
    create: {
      id: 'slot-1',
      bookingId: booking.id,
      courtId: tennisCourt.id,
      startTime: new Date('2024-12-20T09:00:00Z'),
      endTime: new Date('2024-12-20T10:00:00Z'),
      status: 'CONFIRMED',
      createdBy: regularPlayer.id,
    },
  });

  // Create sample plan
  const basicPlan = await prisma.plan.upsert({
    where: { id: 'plan-1' },
    update: {},
    create: {
      id: 'plan-1',
      name: 'Basic Monthly Plan',
      description: 'Access to all courts with 20% discount',
      scope: 'FACILITY',
      amount: 500000, // 500k VND
      currency: 'VND',
      billingCycle: 'MONTHLY',
      features: { discount: '20%', access: 'all_courts' },
      active: true,
    },
  });

  // Create sample subscription
  const subscription = await prisma.subscription.upsert({
    where: { id: 'sub-1' },
    update: {},
    create: {
      id: 'sub-1',
      ownerId: regularPlayer.id,
      planId: basicPlan.id,
      quantity: 1,
      amount: 500000,
      status: 'ACTIVE',
      startDate: new Date('2024-12-01T00:00:00Z'),
      nextBillingDate: new Date('2025-01-01T00:00:00Z'),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👥 Users created:', { adminUser, facilityOwner, regularPlayer });
  console.log('🏢 Facility created:', { facility });
  console.log('🎾 Courts created:', { tennisCourt, badmintonCourt });
  console.log('📅 Booking created:', { booking });
  console.log('⏰ Booking slot created:', { bookingSlot });
  console.log('📋 Plan created:', { basicPlan });
  console.log('💳 Subscription created:', { subscription });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(console.error);
  });
