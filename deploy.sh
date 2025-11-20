#!/bin/bash

# River Raid - Deployment Script
# This script builds and runs the game in different modes

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================="
echo "River Raid - Deployment Script"
echo "=================================="
echo ""

# Function to display usage
usage() {
    echo "Usage: ./deploy.sh [MODE]"
    echo ""
    echo "Modes:"
    echo "  dev       - Start development server (default)"
    echo "  build     - Build for production"
    echo "  preview   - Build and preview production build"
    echo "  prod      - Build and serve production (using simple HTTP server)"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh dev      # Start development server"
    echo "  ./deploy.sh build    # Build for production"
    echo "  ./deploy.sh preview  # Preview production build"
    echo ""
    exit 1
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please run ./install.sh first"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Warning: Dependencies not installed${NC}"
    echo "Running npm install..."
    npm install
fi

# Get mode from argument (default to dev)
MODE=${1:-dev}

case "$MODE" in
    dev)
        echo -e "${GREEN}Starting development server...${NC}"
        echo -e "${BLUE}The game will be available at: http://localhost:3000${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        npm run dev
        ;;

    build)
        echo -e "${GREEN}Building for production...${NC}"
        npm run build
        echo ""
        echo -e "${GREEN}✓ Build completed successfully!${NC}"
        echo -e "Build output is in the ${BLUE}dist/${NC} directory"
        echo ""
        echo "To preview the build, run: ./deploy.sh preview"
        echo "To deploy to a web server, copy the contents of the dist/ directory"
        ;;

    preview)
        echo -e "${GREEN}Building for production...${NC}"
        npm run build
        echo ""
        echo -e "${GREEN}Starting preview server...${NC}"
        echo -e "${BLUE}The game will be available at: http://localhost:4173${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        npm run preview
        ;;

    prod)
        echo -e "${GREEN}Building for production...${NC}"
        npm run build
        echo ""

        # Check if serve is installed globally
        if ! command -v serve &> /dev/null; then
            echo -e "${YELLOW}Installing 'serve' package globally...${NC}"
            npm install -g serve
        fi

        echo -e "${GREEN}Starting production server...${NC}"
        echo -e "${BLUE}The game will be available at: http://localhost:3000${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        serve -s dist -l 3000
        ;;

    help|--help|-h)
        usage
        ;;

    *)
        echo -e "${RED}Error: Unknown mode '$MODE'${NC}"
        echo ""
        usage
        ;;
esac
