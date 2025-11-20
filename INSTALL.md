# Installation Guide - River Raid

This guide will help you install and run River Raid on any server, including WSL Ubuntu Linux.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Install (Automated)](#quick-install-automated)
- [Manual Installation](#manual-installation)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Ubuntu 18.04+, Debian 10+, WSL2 Ubuntu, macOS 10.15+, or Windows 10+
- **Node.js**: Version 16.x or higher (20.x LTS recommended)
- **npm**: Version 7.x or higher (comes with Node.js)
- **RAM**: 512 MB minimum, 1 GB recommended
- **Disk Space**: 500 MB for dependencies

### Recommended

- **Node.js**: 20.x LTS
- **RAM**: 2 GB
- **Modern web browser**: Chrome, Firefox, Safari, or Edge (latest version)

---

## Quick Install (Automated)

The easiest way to install River Raid is using the automated installation script.

### On Ubuntu/WSL/Debian

```bash
# Make the install script executable
chmod +x install.sh

# Run the installation
./install.sh
```

The script will:
1. Check your system requirements
2. Install Node.js (if not already installed)
3. Install all project dependencies
4. Verify the installation

---

## Manual Installation

If you prefer to install manually or the automated script doesn't work for your system:

### Step 1: Install Node.js

#### Ubuntu/Debian/WSL

```bash
# Update package list
sudo apt-get update

# Install curl if not already installed
sudo apt-get install -y curl

# Add NodeSource repository for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs
```

#### macOS

Using Homebrew:
```bash
brew install node@20
```

Or download from [nodejs.org](https://nodejs.org/)

#### Windows

Download and install from [nodejs.org](https://nodejs.org/)

Or use Windows Package Manager:
```powershell
winget install OpenJS.NodeJS.LTS
```

### Step 2: Verify Installation

```bash
node --version  # Should show v16.x or higher
npm --version   # Should show v7.x or higher
```

### Step 3: Install Project Dependencies

Navigate to the project directory and run:

```bash
npm install
```

This will install all required dependencies listed in `package.json`.

---

## Platform-Specific Instructions

### WSL (Windows Subsystem for Linux)

1. **Install WSL2** (if not already installed):
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   ```

2. **Install Ubuntu** from Microsoft Store (recommended: Ubuntu 22.04 LTS)

3. **Open Ubuntu terminal** and navigate to your project:
   ```bash
   cd /mnt/c/Users/YourUsername/path/to/g-river-raid
   ```

4. **Run the install script**:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

5. **Access the game**: Open your Windows browser and go to `http://localhost:3000`

**WSL Tips:**
- Files in `/mnt/c/` are on your Windows filesystem
- For better performance, consider moving the project to your WSL home directory: `~/`
- You can access WSL files from Windows at `\\wsl$\Ubuntu\home\username\`

### Native Ubuntu/Debian

Simply run the install script:
```bash
chmod +x install.sh
./install.sh
```

### macOS

1. Install Homebrew (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Node.js:
   ```bash
   brew install node@20
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Docker (Alternative)

If you prefer to use Docker:

```bash
# Build the image
docker build -t river-raid .

# Run the container
docker run -p 3000:3000 river-raid
```

Note: You'll need to create a `Dockerfile` first (not included by default).

---

## Verification

After installation, verify everything works:

```bash
# Start the development server
npm run dev

# Or use the deploy script
chmod +x deploy.sh
./deploy.sh dev
```

Open your browser and navigate to `http://localhost:3000`

You should see the River Raid game menu.

---

## Troubleshooting

### Node.js version too old

**Error**: `The engine "node" is incompatible with this module`

**Solution**: Update Node.js to version 16 or higher:
```bash
# Ubuntu/WSL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Permission denied errors

**Error**: `EACCES: permission denied`

**Solution**: Don't use `sudo` with npm. If you must, fix npm permissions:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Port 3000 already in use

**Error**: `Port 3000 is already in use`

**Solution**:
1. Kill the process using port 3000:
   ```bash
   # Find the process
   lsof -i :3000

   # Kill it (replace PID with actual process ID)
   kill -9 PID
   ```

2. Or edit `vite.config.ts` to use a different port

### WSL: Cannot access localhost

**Issue**: Browser can't connect to `http://localhost:3000`

**Solution**:
1. Make sure Windows Firewall allows the connection
2. Try accessing via WSL IP address:
   ```bash
   # Get WSL IP
   ip addr show eth0 | grep inet | awk '{print $2}' | cut -d/ -f1
   ```
3. Ensure Vite is binding to `0.0.0.0` (already configured in this project)

### Module not found errors

**Error**: `Cannot find module 'xyz'`

**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails

**Error**: Build fails with TypeScript errors

**Solution**:
1. Ensure TypeScript is installed:
   ```bash
   npm install -D typescript
   ```

2. Clean and rebuild:
   ```bash
   rm -rf dist
   npm run build
   ```

---

## Project Structure

After installation, your project structure will look like this:

```
g-river-raid/
├── components/              # React components
│   ├── RiverRaidGame.tsx   # Main game engine and logic
│   ├── VirtualJoystick.tsx # Mobile touch joystick
│   ├── ShootButton.tsx     # Mobile fire button
│   └── FullscreenButton.tsx# Fullscreen toggle
├── utils/                   # Utility functions
│   └── mobile.ts           # Mobile device detection
├── App.tsx                  # Main app component with menu
├── index.tsx                # React entry point
├── types.ts                 # TypeScript type definitions
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── install.sh               # Installation script
├── deploy.sh                # Deployment script
├── README.md                # Project overview
├── QUICKGUIDE.md            # Quick start guide
├── INSTALL.md               # This file
└── GUIDE.md                 # Detailed gameplay guide
```

## Next Steps

Once installation is complete:

1. **Read the guides**:
   - [Quick Start Guide](QUICKGUIDE.md) - Learn how to run and play
   - [Game Guide](GUIDE.md) - Detailed gameplay mechanics
   - [README.md](README.md) - Project overview

2. **Run the development server**:
   ```bash
   npm run dev
   # Or using the deploy script
   ./deploy.sh dev
   ```

3. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - On mobile: Use your device's browser

4. **Start playing**:
   - Click "Insert Coin" to begin
   - Use arrow keys or WASD to move
   - Press SPACE to fire
   - Have fun!

---

## Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/yourusername/g-river-raid/issues)
2. Review the [package.json](package.json) for dependency requirements
3. Ensure you're using a supported Node.js version (16+)

---

## System Information

To report issues, please include your system information:

```bash
# Run this command and include the output
echo "OS: $(uname -a)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Project: $(pwd)"
```

---

**Installation complete!** 🎮 Ready to play River Raid!
