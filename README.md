# 🦁 Wild Guess

**Can you stump the AI with animal images?**

A decentralized Web3 game on GenLayer blockchain where you challenge AI to identify animal images. Upload an image and win if the AI guesses wrong!

![Wild Guess Banner](./Genlayerlogo.jpg)

## 🎮 How to Play

1. **Connect** your MetaMask wallet
2. **Upload** an animal image (URL or file)
3. **Submit** your challenge with the correct animal name
4. **AI analyzes** the image and makes its guess
5. **Win** if AI guesses incorrectly!
6. **Track** your wins, streaks, and compete on the leaderboard

## ✨ Features

- 🤖 **AI-Powered Image Recognition** - GenLayer's Intelligent Contracts analyze images
- 🏆 **Leaderboard System** - Compete with other players
- 📊 **Stats Tracking** - Monitor your wins, losses, and win streaks
- 📁 **Dual Upload Options** - Upload by URL or file (via ImgBB)
- 🎯 **Challenge History** - View all your past challenges
- 🎨 **Modern UI** - Clean, professional design with glassmorphism
- 💰 **No Tokens Required** - Just pure fun competition!

## 🛠️ Technology Stack

- **Blockchain**: GenLayer Studio (Chain ID: 61999)
- **Smart Contract**: Python-based Intelligent Contract
- **Frontend**: Vanilla JavaScript + Vite
- **Styling**: Modern CSS with glassmorphism effects
- **Wallet**: MetaMask integration
- **Image Upload**: ImgBB API
- **AI Consensus**: Optimistic Democracy on GenLayer

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wild-guess.git
   cd wild-guess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🚀 Deploy to Vercel

### Method 1: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Method 2: Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Method 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/wild-guess)

## 🔧 Configuration

### GenLayer Network Setup

The app automatically prompts users to add GenLayer network to MetaMask:

- **Network Name**: GenLayer Studio
- **RPC URL**: https://studio.genlayer.com/api
- **Chain ID**: 61999 (0xf22f)
- **Currency Symbol**: GEN

### Contract Address

Update the contract address in `lib/genlayer/client.js`:

```javascript
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
```

### ImgBB API Key (Optional)

For file uploads, update the API key in `app.js`:

```javascript
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';
```

## 📂 Project Structure

```
wild-guess/
├── index.html              # Main HTML file
├── app.js                  # Game logic and Web3 integration
├── style.css               # Styling with modern design
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
├── Genlayerlogo.jpg        # GenLayer logo
├── lib/
│   ├── contracts/
│   │   └── WildGuess.js    # Smart contract interface
│   └── genlayer/
│       └── client.js       # GenLayer client setup
└── wild_guess.py           # Smart contract (Python)
```

## 🎯 Smart Contract

The game uses a GenLayer Intelligent Contract written in Python:

- **File**: `wild_guess.py`
- **Features**:
  - AI image recognition using Optimistic Democracy
  - Player statistics tracking (wins, losses, streaks)
  - Leaderboard system
  - Challenge history

### Deploy Contract

1. Go to [GenLayer Studio](https://studio.genlayer.com)
2. Create new contract
3. Upload `wild_guess.py`
4. Deploy and copy the contract address
5. Update `lib/genlayer/client.js` with the new address

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🔗 Links

- **Live Demo**: [Your Vercel URL]
- **GenLayer**: https://genlayer.com
- **GenLayer Studio**: https://studio.genlayer.com
- **Documentation**: [Your docs URL]

## 💡 Future Enhancements

- [ ] Add more animal categories
- [ ] Implement difficulty levels
- [ ] Add achievements/badges
- [ ] Social sharing features
- [ ] Dark mode toggle
- [ ] Mobile app version

## 🙏 Acknowledgments

- Built on [GenLayer](https://genlayer.com) blockchain
- Powered by GenLayer's Intelligent Contracts
- Image upload via [ImgBB](https://imgbb.com)

---

**Can you fool the AI?** 🎯 Connect your wallet and start playing!

Made with ❤️ by [Your Name]
