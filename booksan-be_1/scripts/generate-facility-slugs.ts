import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name: string, id: string): string {
  // Convert to lowercase and replace spaces with hyphens
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();

  // Add a unique suffix using part of the ID to ensure uniqueness
  const uniqueSuffix = id.slice(-6);
  return `${baseSlug}-${uniqueSuffix}`;
}

async function generateSlugsForExistingFacilities() {
  console.log('🔄 Generating slugs for existing facilities...');
  
  try {
    // Get all facilities without slugs
    const facilities = await prisma.facility.findMany({
      where: {
        slug: {
          equals: '',
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`📊 Found ${facilities.length} facilities without slugs`);

    // Generate and update slugs
    for (const facility of facilities) {
      const slug = generateSlug(facility.name, facility.id);
      
      try {
        await prisma.facility.update({
          where: { id: facility.id },
          data: { slug },
        });
        console.log(`✅ Generated slug for "${facility.name}": ${slug}`);
      } catch (error) {
        console.error(`❌ Failed to update facility ${facility.id}:`, error);
      }
    }

    console.log('🎉 Slug generation completed!');
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  generateSlugsForExistingFacilities();
}

export { generateSlugsForExistingFacilities };
