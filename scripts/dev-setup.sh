#!/bin/bash

# =============================================================================
# SV-SDK Development Environment Setup Script
# =============================================================================
# This script automates the setup of the local development environment
# Run with: ./scripts/dev-setup.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Header
echo ""
echo "======================================================================"
echo "   SV-SDK Development Environment Setup"
echo "======================================================================"
echo ""

# Step 1: Check prerequisites
log_info "Checking prerequisites..."
check_command node
check_command pnpm
check_command docker
check_command docker-compose
log_success "All prerequisites are installed"

# Step 2: Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18 or higher is required (found v$NODE_VERSION)"
    exit 1
fi
log_success "Node.js version is compatible (v$NODE_VERSION)"

# Step 3: Setup environment file
log_info "Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    log_success "Created .env file from .env.example"
    log_warning "Please edit .env file with your configuration"
else
    log_warning ".env file already exists, skipping"
fi

# Step 4: Install dependencies
log_info "Installing dependencies with pnpm..."
pnpm install
log_success "Dependencies installed"

# Step 5: Start Docker services
log_info "Starting Docker services (PostgreSQL & Redis)..."
docker-compose up -d
log_success "Docker services started"

# Step 6: Wait for services to be healthy
log_info "Waiting for services to be ready..."
sleep 5

# Check PostgreSQL
until docker-compose exec -T postgres pg_isready -U sv_sdk_user -d sv_sdk &> /dev/null; do
    log_info "Waiting for PostgreSQL..."
    sleep 2
done
log_success "PostgreSQL is ready"

# Check Redis
until docker-compose exec -T redis redis-cli -a ${REDIS_PASSWORD:-dev_redis_password} ping &> /dev/null; do
    log_info "Waiting for Redis..."
    sleep 2
done
log_success "Redis is ready"

# Step 7: Run database migrations (if db-config package exists)
if [ -d "packages/db-config" ]; then
    log_info "Running database migrations..."
    pnpm db:migrate
    log_success "Migrations completed"
    
    # Step 8: Seed database
    log_info "Seeding database with initial data..."
    pnpm db:seed
    log_success "Database seeded"
else
    log_warning "Database package not found, skipping migrations"
fi

# Step 9: Build all packages
log_info "Building all packages..."
pnpm build
log_success "All packages built successfully"

# Final message
echo ""
echo "======================================================================"
echo -e "${GREEN}✓ Development environment setup complete!${NC}"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "  1. Review and update .env file with your configuration"
echo "  2. Run 'pnpm dev' to start development servers"
echo "  3. Access admin panel at http://localhost:5173"
echo "  4. Default credentials: admin@example.com / Admin123!"
echo ""
echo "Useful commands:"
echo "  pnpm dev              - Start all development servers"
echo "  pnpm build            - Build all packages"
echo "  pnpm test             - Run all tests"
echo "  pnpm db:studio        - Open Drizzle Studio"
echo "  docker-compose logs   - View service logs"
echo ""

