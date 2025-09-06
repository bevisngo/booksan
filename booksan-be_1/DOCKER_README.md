# Docker Setup Guide

This project uses Docker Compose to run PostgreSQL and Redis services locally for development.

## 🐳 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)

## 🚀 Quick Start

### 1. Start Services
```bash
# Start all services
npm run docker:start

# Or manually
docker-compose up -d
```

### 2. Check Service Status
```bash
# View running containers
npm run docker:ps

# View logs
npm run docker:logs
```

### 3. Stop Services
```bash
# Stop all services
npm run docker:stop

# Or manually
docker-compose down
```

## 📊 Services

### PostgreSQL
- **Port**: 5432
- **Database**: booksan_db
- **Username**: booksan_user
- **Password**: booksan_password
- **Connection URL**: `postgresql://booksan_user:booksan_password@localhost:5432/booksan_db?schema=public`

### Redis
- **Port**: 6379
- **Connection URL**: `redis://localhost:6379`
- **Persistence**: Enabled with AOF (Append Only File)
- **Memory Limit**: 256MB

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your project root:
```env
# Database Configuration (Docker Compose)
DATABASE_URL="postgresql://booksan_user:booksan_password@localhost:5432/booksan_db?schema=public"

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Docker Compose
The `docker-compose.yml` file includes:
- Health checks for both services
- Persistent data volumes
- Custom Redis configuration
- PostgreSQL initialization scripts
- Network isolation

## 📁 File Structure
```
docker/
├── compose.yml              # Main Docker Compose file
├── postgres/
│   └── init/
│       └── 01-init.sql     # PostgreSQL initialization
├── redis/
│   └── redis.conf          # Redis configuration
└── scripts/
    ├── start.sh            # Start services
    ├── stop.sh             # Stop services
    └── reset.sh            # Reset everything
```

## 🛠️ Available Commands

### NPM Scripts
- `npm run docker:start` - Start all services
- `npm run docker:stop` - Stop all services
- `npm run docker:reset` - Reset all services and data
- `npm run docker:logs` - View service logs
- `npm run docker:ps` - Show service status

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart services
docker-compose restart

# Remove everything (including data)
docker-compose down -v
```

## 🔍 Monitoring

### Check Service Health
```bash
# PostgreSQL health check
docker-compose exec postgres pg_isready -U booksan_user -d booksan_db

# Redis health check
docker-compose exec redis redis-cli ping
```

### View Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Access Services Directly
```bash
# PostgreSQL shell
docker-compose exec postgres psql -U booksan_user -d booksan_db

# Redis CLI
docker-compose exec redis redis-cli
```

## 🗄️ Database Operations

### First Time Setup
1. Start services: `npm run docker:start`
2. Generate Prisma client: `npm run db:generate`
3. Push schema: `npm run db:push`
4. Seed database: `npm run db:seed`

### Development Workflow
```bash
# Make schema changes
# Edit prisma/schema.prisma

# Regenerate client
npm run db:generate

# Push changes to database
npm run db:push

# Or create migration
npm run db:migrate
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :5432
   lsof -i :6379
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Permission denied on scripts**
   ```bash
   chmod +x docker/scripts/*.sh
   ```

3. **Services not starting**
   ```bash
   # Check Docker logs
   docker-compose logs
   
   # Check Docker status
   docker info
   ```

4. **Data persistence issues**
   ```bash
   # Check volumes
   docker volume ls
   
   # Inspect volume
   docker volume inspect booksan-be_1_postgres_data
   ```

### Reset Everything
```bash
# Complete reset (⚠️ DESTRUCTIVE)
npm run docker:reset

# Or manually
docker-compose down -v --rmi all
docker volume prune -f
docker network prune -f
```

## 🔒 Security Notes

- **Development Only**: This setup is for development purposes
- **No Authentication**: Redis has no password protection
- **Local Access**: Services are only accessible from localhost
- **Production**: Use proper security measures in production

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/docker)
