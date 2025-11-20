<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# River Raid - Remastered Edition

A modern remake of the classic 1982 River Raid game, built with React and TypeScript. This standalone version runs on any server - no Google AI Studio required!

## 🎮 Features

- Classic River Raid gameplay with modern graphics
- Runs on any platform: Ubuntu, WSL, macOS, Windows
- No external dependencies or API keys required
- Responsive controls and smooth gameplay
- Retro aesthetics with modern web technologies

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
- **[LICENSE](LICENSE)** - MIT License

## 🎯 Game Controls

- **Arrow Keys** or **WASD** - Move your aircraft
- **Space** - Fire weapons
- **ESC** - Return to menu

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

- **React 19** - UI framework
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool and dev server
- **Modern JavaScript** - ES modules

## 🤝 Contributing

Contributions are welcome! This is an open-source project under the MIT License.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Ready to play?** Run `./deploy.sh dev` and enjoy! 🚀
