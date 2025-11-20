# Quick Start Guide - River Raid

Get up and running with River Raid in under 5 minutes!

## 🚀 Quick Start (TL;DR)

```bash
# 1. Install dependencies
./install.sh

# 2. Start the game
./deploy.sh dev

# 3. Open browser to http://localhost:3000

# 4. Play!
```

---

## 📋 Table of Contents

- [First Time Setup](#first-time-setup)
- [Running the Game](#running-the-game)
- [Game Controls](#game-controls)
- [Gameplay Guide](#gameplay-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Common Commands](#common-commands)

---

## 🔧 First Time Setup

### Automated Installation

```bash
# Make scripts executable
chmod +x install.sh deploy.sh

# Run installation
./install.sh
```

That's it! The script installs everything you need.

### Manual Installation

If the script doesn't work:

```bash
# Install Node.js 20.x (Ubuntu/WSL)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install
```

---

## 🎮 Running the Game

### Development Mode (Recommended for local play)

```bash
# Using deploy script
./deploy.sh dev

# Or using npm directly
npm run dev
```

The game will start at `http://localhost:3000`

**Features:**
- Hot reload (changes update automatically)
- Fast startup
- Development tools enabled

### Production Mode

```bash
# Build and preview
./deploy.sh preview

# Or build only
./deploy.sh build
```

---

## 🕹️ Game Controls

### Keyboard Controls

| Key | Action |
|-----|--------|
| **↑** or **W** | Move Up |
| **↓** or **S** | Move Down |
| **←** or **A** | Move Left |
| **→** or **D** | Move Right |
| **SPACE** | Fire Weapons |

### Menu Controls

- **Click "Insert Coin / Start"** - Begin game
- **ESC** or click exit - Return to menu

---

## 🎯 Gameplay Guide

### Mission Objective

Navigate your fighter jet down a dangerous river while destroying enemies and managing your fuel.

### Game Elements

#### Enemies

- **🛩️ Enemy Jets** - Flying hostile aircraft
- **🚁 Helicopters** - Hovering threats
- **🚢 Submarines** - Water-based enemies
- **💀 Boss** - Appears at the end of the river

#### Power-ups

- **🟣 Fuel Canisters** - Refuel your aircraft
- **⭐ Bonus Items** - Extra points

### Gameplay Tips

1. **Watch Your Fuel** - Always monitor the fuel gauge
2. **Collect Fuel Depots** - Fly over pink fuel canisters to refuel
3. **Avoid Collisions** - Don't hit riverbanks or enemies
4. **Strategic Shooting** - Destroy enemies before they reach you
5. **Boss Strategy** - The final boss requires multiple hits

### Scoring

- Destroying enemies: +100 points
- Collecting items: +50 points
- Surviving longer: +distance bonus

---

## 💻 Development

### Project Structure

```
g-river-raid/
├── App.tsx                 # Main app component
├── components/
│   └── RiverRaidGame.tsx  # Game logic and rendering
├── types.ts               # TypeScript type definitions
├── index.html             # HTML entry point
├── index.tsx              # React entry point
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies
├── install.sh             # Installation script
├── deploy.sh              # Deployment script
├── INSTALL.md             # Detailed installation guide
└── QUICKGUIDE.md          # This file
```

### Making Changes

1. **Edit game code** in `components/RiverRaidGame.tsx`
2. **Edit UI/menu** in `App.tsx`
3. **Changes auto-reload** when running in dev mode

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Deployment

### Deploy Script Options

```bash
./deploy.sh dev      # Development server
./deploy.sh build    # Build for production
./deploy.sh preview  # Build and preview
./deploy.sh prod     # Production server
```

### Deploy to Web Server

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your web server

3. **Configure web server** to serve the files:

   **Apache (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **Nginx:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### Deploy to Specific Platforms

#### GitHub Pages

```bash
npm run build
# Upload dist/ contents to gh-pages branch
```

#### Netlify

```bash
# Build command: npm run build
# Publish directory: dist
```

#### Vercel

```bash
# Framework: Vite
# Build command: npm run build
# Output directory: dist
```

---

## 📝 Common Commands

### Installation & Setup

```bash
./install.sh                    # Install all dependencies
chmod +x install.sh deploy.sh   # Make scripts executable
```

### Running

```bash
./deploy.sh dev                 # Start development server
./deploy.sh preview             # Build and preview production
npm run dev                     # Alternative: start dev server
```

### Building

```bash
./deploy.sh build              # Build for production
npm run build                  # Alternative: build
```

### Troubleshooting

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check versions
node --version
npm --version

# View running processes
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)
```

---

## 🌐 Accessing the Game

### Local Development

- **Default URL**: `http://localhost:3000`
- **Network URL**: `http://<your-ip>:3000` (accessible from other devices)

### From WSL

When running in WSL, you can access from Windows browser:
- `http://localhost:3000` (usually works)
- `http://<wsl-ip>:3000` (if localhost doesn't work)

Get WSL IP:
```bash
ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'
```

### From Network

To access from other devices on your network:

1. **Find your IP address:**
   ```bash
   # Ubuntu/WSL
   hostname -I | awk '{print $1}'
   ```

2. **Access from other device:**
   ```
   http://<your-ip>:3000
   ```

3. **Ensure firewall allows connections** on port 3000

---

## 🐛 Quick Troubleshooting

### Game won't start

```bash
# Check if dependencies are installed
ls node_modules

# Reinstall if missing
npm install
```

### Port already in use

```bash
# Kill the process
kill -9 $(lsof -t -i:3000)

# Or change port in vite.config.ts
```

### Browser shows blank page

1. Check browser console for errors (F12)
2. Clear browser cache (Ctrl+Shift+R)
3. Rebuild the project:
   ```bash
   rm -rf dist
   npm run build
   ```

### Slow performance

1. Use production build: `./deploy.sh preview`
2. Close other applications
3. Try a different browser

---

## 📚 Additional Resources

- **Full Installation Guide**: See [INSTALL.md](INSTALL.md)
- **License**: See [LICENSE](LICENSE)
- **Source Code**: Check the code in `App.tsx` and `components/`

---

## 🎮 Tips for Best Experience

1. **Use a modern browser** (Chrome, Firefox, Edge, Safari latest)
2. **Full screen mode** for immersive gameplay (F11)
3. **Adjust volume** - Sound effects enhance the experience
4. **Practice controls** in the early game sections
5. **Challenge yourself** - Try to beat your high score!

---

## ⚡ Performance Tips

### For Development

```bash
# Use development mode (fastest)
npm run dev
```

### For Production

```bash
# Build with optimizations
npm run build

# Preview optimized build
./deploy.sh preview
```

### Browser Performance

- Close unnecessary tabs
- Disable browser extensions
- Use hardware acceleration (usually enabled by default)

---

## 🆘 Getting Help

Having issues? Here's how to get help:

1. **Check [INSTALL.md](INSTALL.md)** for detailed troubleshooting
2. **Review error messages** in the terminal
3. **Check browser console** (F12) for JavaScript errors
4. **Verify Node.js version** is 16+ with `node --version`

---

**Ready to Play!** 🎮

```bash
./deploy.sh dev
```

Then open `http://localhost:3000` and enjoy! 🚀
