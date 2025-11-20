#!/bin/bash

# River Raid - Installation Script for Ubuntu/WSL
# This script installs all dependencies needed to run the game

set -e  # Exit on error

echo "=================================="
echo "River Raid - Installation Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
    echo -e "${RED}Error: This script is designed for Ubuntu/Debian-based systems${NC}"
    echo "Please install Node.js manually: https://nodejs.org/"
    exit 1
fi

echo -e "${YELLOW}[1/4] Checking system requirements...${NC}"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js is already installed: $NODE_VERSION${NC}"

    # Check if version is acceptable (v16+)
    MAJOR_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 16 ]; then
        echo -e "${YELLOW}⚠ Node.js version is older than recommended (v16+)${NC}"
        echo "Consider upgrading for best compatibility"
    fi
else
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"

    # Update package list
    sudo apt-get update

    # Install Node.js and npm using NodeSource repository (LTS version)
    echo -e "${YELLOW}Installing Node.js LTS...${NC}"

    # Install dependencies
    sudo apt-get install -y curl

    # Download and run NodeSource setup script for Node.js 20.x (LTS)
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

    # Install Node.js
    sudo apt-get install -y nodejs

    echo -e "${GREEN}✓ Node.js installed successfully${NC}"
fi

# Verify npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    sudo apt-get install -y npm
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm version: $NPM_VERSION${NC}"

echo ""
echo -e "${YELLOW}[2/4] Installing project dependencies...${NC}"

# Install dependencies
npm install

echo -e "${GREEN}✓ Dependencies installed successfully${NC}"

echo ""
echo -e "${YELLOW}[3/4] Checking optional dependencies...${NC}"

# Check if git is installed (useful for version control)
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git is not installed. Installing...${NC}"
    sudo apt-get install -y git
    echo -e "${GREEN}✓ Git installed${NC}"
else
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓ $GIT_VERSION${NC}"
fi

echo ""
echo -e "${YELLOW}[4/4] Running final checks...${NC}"

# Verify installation by checking if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules directory created${NC}"
else
    echo -e "${RED}✗ Installation may have failed - node_modules not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=================================="
echo "✓ Installation completed successfully!"
echo "==================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Run development server: npm run dev"
echo "  2. Or use the deploy script: ./deploy.sh"
echo "  3. Access the game at: http://localhost:3000"
echo ""
echo "For more information, see INSTALL.md and QUICKGUIDE.md"
echo ""
