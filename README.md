# Solana Starter - Farcaster Mini App

A beginner-friendly starter template for building Solana applications on Farcaster. This template includes everything you need to get started with Solana wallet integration, token transfers, and Farcaster mini-app features.

## 🚀 Features

- **Solana Wallet Integration** - Connect and interact with Solana wallets
- **Token Transfers** - Send SOL and SPL tokens (USDC, USDT, BONK)
- **Message Signing** - Sign messages with Solana wallets
- **Farcaster Mini App** - Full Farcaster integration with notifications
- **Beginner Friendly** - Clean, simple code with helpful comments

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.) u have to test on mainnet
- A Farcaster account
- Basic knowledge of React and TypeScript

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd farcaster-solana-starter
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 4. Configure Environment Variables

Edit `.env.local` with your values:

```env
# Your app URL (you'll get this from Cloudflare tunnel) follow ###5 for cloudflare setup
NEXT_PUBLIC_URL=https://your-app-url.ngrok.io

# Redis configuration (for notifications)
KV_REST_API_URL=your_redis_url_here
KV_REST_API_TOKEN=your_redis_token_here

# Farcaster API key (optional)
NEYNAR_API_KEY=your_neynar_api_key_here
```

### 5. Set Up Cloudflare Tunnel

Install Cloudflare tunnel:

```bash
# Install cloudflared
brew install cloudflared  # macOS
# or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Start tunnel
cloudflared tunnel --url http://localhost:3000  (make sure your app and cloudflared tunnel run on same port)
```

Copy the provided URL and update `NEXT_PUBLIC_URL` in your `.env.local` file.

### 6. Set Up Redis (Optional - for notifications)

If you want to use notifications, set up a Redis instance:

1. Go to [Upstash](https://upstash.com/) and create a free Redis database
2. Copy the `REST API URL` and `REST API Token`
3. Update your `.env.local` file

### 7. Run the Development Server

```bash
pnpm dev
```

Your app will be available at `http://localhost:3000`

## 🎯 How to Test on Farcaster

### 1. Deploy to Farcaster Development

1. Open Farcaster app on your phone
2. Go to Settings → Developer → Development
3. Paste your Cloudflare tunnel URL
4. The app should appear in your development section

### 2. Test the Features

- **Connect Wallet**: The app will automatically connect to your Solana wallet
- **Sign Message**: Test message signing functionality
- **Send SOL**: Send a small amount of SOL to the demo address
- **Send Tokens**: Transfer USDC, USDT, or BONK tokens
- **Add to Farcaster**: Add the app to your Farcaster profile
- **Notifications**: Test push notifications (if Redis is configured)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
├── components/            # React components
│   ├── ui/               # UI components
│   ├── providers/        # Context providers
│   └── Demo.tsx          # Main demo component
└── lib/                  # Utility functions
```

## 🔧 Key Components

### Demo.tsx
The main component that demonstrates all Solana and Farcaster features:
- Wallet connection
- Message signing
- SOL transfers
- Token transfers
- Farcaster integration

### SolanaProvider.tsx
Provides Solana wallet context to the entire app.

### API Routes
- `/api/me` - User authentication
- `/api/send-notification` - Send push notifications
- `/api/webhook` - Farcaster webhook handler

## 🎨 Customization

### Adding New Tokens

To add support for new SPL tokens, update the `tokenMints` object in `Demo.tsx`:

```typescript
const tokenMints = useMemo(() => ({
  'USDC': { token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  'YOUR_TOKEN': { token: 'YOUR_TOKEN_MINT_ADDRESS', decimals: 9 },
}), []);
```

### Styling

The app uses Tailwind CSS for styling. You can customize the appearance by modifying the classes in the components.

### Adding New Features

1. Create new components in the `components/` directory
2. Add new API routes in `app/api/`
3. Update the main `Demo.tsx` component to include your new features

## 🐛 Troubleshooting

### Common Issues

**Wallet not connecting:**
- Make sure you have a Solana wallet installed
- Check that the wallet is unlocked
- Try refreshing the page

**Transactions failing:**
- Ensure you have enough SOL for transaction fees
- Check that you have the tokens you're trying to send
- Verify the destination address is correct

**Farcaster integration not working:**
- Make sure your `NEXT_PUBLIC_URL` is correct
- Check that the URL is accessible from the internet
- Verify your Farcaster development settings

### Getting Help

- Check the [Solana Documentation](https://docs.solana.com/)
- Visit the [Farcaster Developer Docs](https://docs.farcaster.xyz/)
- Join the [Solana Discord](https://discord.gg/solana)
- Join the [Farcaster Discord](https://discord.gg/farcaster)

## 📚 Learning Resources

- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)
- [Farcaster Mini Apps](https://docs.farcaster.xyz/mini-apps)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Farcaster](https://farcaster.xyz/) for the mini-app platform
- [Solana](https://solana.com/) for the blockchain infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Happy Building! 🚀**

Start building amazing Solana applications on Farcaster today!
