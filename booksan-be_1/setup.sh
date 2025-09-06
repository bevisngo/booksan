#!/bin/bash

echo "🚀 Setting up Booksan Backend with Prisma and Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration (Docker Compose)
DATABASE_URL="postgresql://booksan_user:booksan_password@localhost:5432/booksan_db?schema=public"

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
npm run docker:start

# Wait a bit for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "📊 Pushing database schema..."
npm run db:push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "🎉 Setup complete! Your Booksan backend is ready."
echo ""
echo "📊 Services running:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - NestJS: localhost:3000"
echo ""
echo "🚀 Next steps:"
echo "   1. Start your NestJS app: npm run start:dev"
echo "   2. Open Prisma Studio: npm run db:studio"
echo "   3. View Docker logs: npm run docker:logs"
echo ""
echo "📚 Useful commands:"
echo "   - Stop services: npm run docker:stop"
echo "   - Reset everything: npm run docker:reset"
echo "   - View status: npm run docker:ps"
