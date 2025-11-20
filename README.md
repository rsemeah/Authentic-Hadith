# # Authentic Hadith Assistant

An AI-powered assistant for learning and understanding hadith through language analysis, thematic exploration, and scholarly reflection.

## Features

- 🤖 AI-assisted hadith learning and exploration
- 💬 Interactive chat interface with conversation persistence
- 🔖 Session-based conversation tracking
- 🚫 Clear boundaries: Does not provide fatwas or personal rulings
- 🏪 Seamless Supabase integration for data storage

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI API (configured in backend)

## Getting Started

### Prerequisites

**Required:**
- Node.js 18+ and npm
- **Uninterrupted access to https://registry.npmjs.org** (for package installation)
- Supabase account and project
- Environment variables configured

**Quick registry check:**
```bash
curl -I https://registry.npmjs.org/
# Expected: HTTP/2 200 or HTTP/1.1 200 OK
```

⚠️ **Important:** If you get `403 Forbidden` or timeout errors, you must resolve registry access issues before proceeding. See [DEPLOYMENT.md](DEPLOYMENT.md#-critical-npm-registry-access-required) for detailed troubleshooting.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rsemeah/Authentic-Hadith.git
cd Authentic-Hadith
```

2. Install dependencies:
```bash
npm install
```

> 💡 **Troubleshooting:** If `npm install` fails with registry errors (403 Forbidden, timeouts, etc.), see the **[NPM Registry Access Required](DEPLOYMENT.md#-critical-npm-registry-access-required)** section in DEPLOYMENT.md for solutions.

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Stripe is used for payments. Add these keys to enable the paywall:
```
STRIPE_SECRET_KEY=sk_live_or_test_key
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_from_stripe
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_from_stripe
APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Authentic-Hadith/
├── app/
│   ├── assistant/
│   │   ├── page.tsx       # Main chat interface
│   │   └── layout.tsx     # Layout for assistant page
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── types/
│   └── supabase.ts        # TypeScript types for database
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Building for Production

```bash
npm run build
npm start
```

> ⚠️ **Registry Access Required:** All build commands require access to https://registry.npmjs.org. If builds fail, see [troubleshooting guide](DEPLOYMENT.md#-critical-npm-registry-access-required).

## Deployment

All deployment platforms require npm registry access during the build phase. See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions and troubleshooting.

### Deploy to Vercel (Recommended)

1. **Verify build works locally:**
   ```bash
   npm ci && npm run build
   ```

2. Push your code to GitHub
3. Connect your repository to [Vercel](https://vercel.com)
4. Add environment variables in Vercel project settings
5. Deploy!

Vercel provides built-in npm registry access - no additional configuration needed.

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js 18+ with Next.js support:

- **Railway** - Built-in registry access, auto-detects Next.js
- **Netlify** - Supports Next.js with registry access
- **AWS Amplify** - Configure build settings
- **Digital Ocean App Platform** - Docker or buildpack deployment
- **Docker** - See [Docker deployment guide](DEPLOYMENT.md#option-4-docker--self-hosted)

**Important:** Before deploying to any platform:
1. ✅ Verify local build succeeds: `npm ci && npm run build`
2. ✅ Check GitHub Actions workflow passes (see Actions tab)
3. ✅ Ensure platform has npm registry access during builds

📚 **See [DEPLOYMENT.md](DEPLOYMENT.md) for:**
- Platform-specific deployment guides
- Registry access troubleshooting
- Docker configuration examples
- CI/CD setup instructions

## API Routes

### POST `/api/assistant`

Sends a message to the assistant and receives a response.

**Request:**
```json
{
  "message": "string",
  "hadithId": "string (optional)",
  "sessionId": "string (optional)"
}
```

**Response:**
```json
{
  "reply": "string",
  "aiMessageId": "string",
  "sessionId": "string"
}
```

### POST `/api/report-ai`

Reports an AI response for quality control.

**Request:**
```json
{
  "aiMessageId": "string",
  "description": "string"
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Before Submitting a PR

1. **Verify registry access:**
   ```bash
   curl -I https://registry.npmjs.org/  # Should return 200
   ```

2. **Test build locally:**
   ```bash
   npm ci
   npm run build
   npm run lint
   ```

3. **Check GitHub Actions:**
   - Ensure "NPM Registry Access Check" workflow passes
   - View workflow results in the Actions tab

4. **Review checklist:**
   - [ ] Code builds successfully
   - [ ] No linting errors
   - [ ] Changes are documented
   - [ ] Registry check workflow passes

If the registry check workflow fails, see [DEPLOYMENT.md](DEPLOYMENT.md#-critical-npm-registry-access-required) for troubleshooting before requesting review.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please create a GitHub issue or contact the maintainers.

---

**Important Note:** This assistant helps with language, themes, and gentle reflection about hadith. It does NOT give fatwas or personal rulings. For halal/haram and legal decisions, please consult qualified scholars.