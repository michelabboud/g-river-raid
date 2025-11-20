<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# River Raid - Remastered Edition

A modern remake of the classic 1982 River Raid game, built with React and TypeScript. This standalone version runs on any server - no Google AI Studio required!

## 🎮 Features

### Core Gameplay
- **Classic River Raid Experience** - Faithful recreation of the iconic 1982 arcade game
- **Procedurally Generated Rivers** - Endless gameplay with dynamic terrain generation
- **Progressive Difficulty** - Challenges increase as you advance through levels
- **Multiple Enemy Types** - Face helicopters, ships, jets, submarines, tanks, and bosses
- **Power-Up System** - Collect spread shot, rapid fire, speed boost, shields, and extra lives
- **Fuel Management** - Strategic fuel collection adds tension to gameplay

### Modern Enhancements
- **Mobile-Friendly** - Touch controls with virtual joystick and fire button
- **Fullscreen Support** - Immersive gameplay experience
- **Responsive Design** - Adapts to any screen size
- **High Score Leaderboard** - Local storage persistence for tracking achievements
- **Coin/Reward System** - Earn "Bravery Coins" to unlock features
- **AI Wingman Companion** - Optional AI drone for co-op assistance
- **Boss Battles** - Epic encounters at the end of each river section

### Technical Features
- **Zero External Dependencies** - No API keys or cloud services required
- **Cross-Platform** - Runs on Ubuntu, WSL, Debian, macOS, and Windows
- **Retro Pixel-Art Graphics** - Hand-crafted sprites with authentic arcade feel
- **Smooth 60 FPS Gameplay** - Optimized canvas rendering
- **Modern Web Technologies** - Built with React 19, TypeScript, and Vite

## 🚀 Quick Start

### Automated Installation (Recommended)

```bash
# Make scripts executable
chmod +x install.sh deploy.sh

# Install dependencies
./install.sh

# Run the game
./deploy.sh dev
```

Then open your browser to `http://localhost:3000` and play!

### Manual Installation

**Prerequisites:** Node.js 16+ (20.x LTS recommended)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 📚 Documentation

- **[INSTALL.md](INSTALL.md)** - Comprehensive installation guide for all platforms
- **[QUICKGUIDE.md](QUICKGUIDE.md)** - Quick start guide and gameplay instructions
- **[GUIDE.md](GUIDE.md)** - Detailed gameplay mechanics and strategy guide
- **[LICENSE](LICENSE)** - MIT License

## 🎲 Gameplay Overview

### Mission Objective
Navigate your fighter jet through a treacherous river, destroying enemy installations while carefully managing your fuel supply. Survive as long as possible to achieve the highest score!

### Key Mechanics
- **Fuel Management** - Your aircraft constantly consumes fuel. Collect fuel canisters to stay airborne
- **Enemy Combat** - Shoot down helicopters, ships, jets, submarines, and tanks for points
- **River Navigation** - Avoid collision with riverbanks and obstacles
- **Power-Ups** - Enhance your firepower with spread shot, rapid fire, and more
- **Boss Battles** - Face challenging bosses at the end of each river section
- **Coin System** - Earn "Bravery Coins" based on survival time (1 coin per minute)
- **Wingman Feature** - Spend 5 coins to unlock an AI companion that fights alongside you

### Scoring
- Destroying enemies: Points vary by enemy type
- Collecting items: Bonus points
- Distance traveled: Continuous score increase
- Boss defeats: Major point bonuses
- High score persistence via local storage

## 🎯 Game Controls

### Desktop Controls
- **Arrow Keys** or **WASD** - Move your aircraft (Up/Down/Left/Right)
- **Spacebar** - Fire weapons
- **P** - Pause/Resume game
- **ESC** - Return to menu

### Mobile Controls
- **Virtual Joystick** (Left side) - Move aircraft in any direction
- **Fire Button** (Right side) - Shoot weapons
- **Fullscreen Button** - Toggle fullscreen mode for immersive play
- Touch controls automatically appear on mobile devices and tablets

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Or use the deploy script:

```bash
./deploy.sh dev      # Development server
./deploy.sh build    # Build for production
./deploy.sh preview  # Preview production build
```

## 🌐 Platform Support

- ✅ Ubuntu Linux (18.04+)
- ✅ WSL (Windows Subsystem for Linux)
- ✅ Debian (10+)
- ✅ macOS (10.15+)
- ✅ Windows (10+)

## 📦 Technology Stack

### Frontend
- **React 19.2.0** - Modern UI framework with concurrent features
- **TypeScript 5.7.3** - Type-safe code with advanced type inference
- **Vite 6.2.0** - Lightning-fast build tool and dev server with HMR

### Styling & Graphics
- **Tailwind CSS 4.0.14** - Utility-first CSS framework
- **HTML5 Canvas** - Hardware-accelerated 2D rendering
- **Custom Pixel Art** - Hand-crafted retro sprites and animations

### State & Storage
- **React Hooks** - Modern state management (useState, useEffect, useCallback)
- **LocalStorage API** - Persistent high scores and game progress

### Development Tools
- **ESLint** - Code quality and consistency
- **TypeScript Compiler** - Static type checking
- **Modern JavaScript (ES2020+)** - ES modules, async/await, optional chaining

## 🤝 Contributing

Contributions are welcome! This is an open-source project under the MIT License.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Ready to play?** Run `./deploy.sh dev` and enjoy! 🚀
