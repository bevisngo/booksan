#!/bin/bash

echo "🛑 Stopping Booksan services..."

# Stop services
docker-compose down

echo "✅ All services stopped!"
echo ""
echo "💾 Data volumes are preserved. To remove them completely, run:"
echo "   docker-compose down -v"
echo ""
echo "🗑️  To remove containers and images, run:"
echo "   docker-compose down --rmi all"
