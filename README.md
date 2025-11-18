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

- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js 18+ with Next.js support:

- Netlify
- Railway
- AWS Amplify
- Digital Ocean App Platform
- Heroku

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please create a GitHub issue or contact the maintainers.

---

**Important Note:** This assistant helps with language, themes, and gentle reflection about hadith. It does NOT give fatwas or personal rulings. For halal/haram and legal decisions, please consult qualified scholars.