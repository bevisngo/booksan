#!/bin/bash

echo "⚠️  WARNING: This will remove all data and containers!"
echo "Are you sure you want to continue? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🔄 Resetting all services and data..."
    
    # Stop and remove everything
    docker-compose down -v --rmi all
    
    # Remove any dangling volumes
    docker volume prune -f
    
    # Remove any dangling networks
    docker network prune -f
    
    echo "✅ Reset complete! All data and containers have been removed."
    echo ""
    echo "🚀 To start fresh, run:"
    echo "   ./docker/scripts/start.sh"
else
    echo "❌ Reset cancelled."
fi
