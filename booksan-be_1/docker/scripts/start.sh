#!/bin/bash

echo "🐳 Starting Booksan services with Docker Compose..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
docker-compose up -d

echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL to be ready
echo "📊 Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U booksan_user -d booksan_db > /dev/null 2>&1; do
    echo "   PostgreSQL is not ready yet..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "🔴 Waiting for Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   Redis is not ready yet..."
    sleep 2
done
echo "✅ Redis is ready!"

# Wait for Elasticsearch to be ready
echo "🔍 Waiting for Elasticsearch..."
until curl -f http://localhost:9200/_cluster/health > /dev/null 2>&1; do
    echo "   Elasticsearch is not ready yet..."
    sleep 5
done
echo "✅ Elasticsearch is ready!"

# Wait for Kibana to be ready
echo "📊 Waiting for Kibana..."
until curl -f http://localhost:5601/api/status > /dev/null 2>&1; do
    echo "   Kibana is not ready yet..."
    sleep 5
done
echo "✅ Kibana is ready!"

echo ""
echo "🎉 All services are running!"
echo ""
echo "📊 PostgreSQL: localhost:5432"
echo "   Database: booksan_db"
echo "   Username: booksan_user"
echo "   Password: booksan_password"
echo ""
echo "🔴 Redis: localhost:6379"
echo ""
echo "🔍 Elasticsearch: localhost:9200"
echo "   API: http://localhost:9200"
echo "   Health: http://localhost:9200/_cluster/health"
echo ""
echo "📊 Kibana: localhost:5601"
echo "   Web UI: http://localhost:5601"
echo ""
echo "🔗 Connection URLs:"
echo "   DATABASE_URL=postgresql://booksan_user:booksan_password@localhost:5432/booksan_db?schema=public"
echo "   REDIS_URL=redis://localhost:6379"
echo "   ELASTICSEARCH_URL=http://localhost:9200"
echo ""
echo "📝 Useful commands:"
echo "   docker-compose logs -f postgres       # View PostgreSQL logs"
echo "   docker-compose logs -f redis          # View Redis logs"
echo "   docker-compose logs -f elasticsearch  # View Elasticsearch logs"
echo "   docker-compose logs -f kibana         # View Kibana logs"
echo "   docker-compose down                   # Stop all services"
echo "   docker-compose restart                # Restart all services"
