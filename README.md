# Synapse - Your Second Brain

An intelligent personal knowledge management system that captures, organizes, and helps you search through everything you save.

## Features

- **Instant Capture**: Save URLs, text, todos, images, and more with a single click
- **Smart Content Detection**: Automatically detects and formats different content types:
  - Articles with rich metadata
  - YouTube videos with embedded players
  - Products with prices
  - Todo lists with checkboxes
  - Quotes with beautiful styling
  - Images and notes
- **Semantic Search**: Find anything using natural language queries
- **Beautiful UI**: Each content type is displayed in the most useful and visually appealing way
- **Private & Secure**: Your data stays on your server with encrypted sessions

## Tech Stack

- **Frontend & Backend**: Next.js 14 with TypeScript and App Router
- **Database**: SQLite with better-sqlite3
- **AI**: Anthropic Claude API for embeddings and semantic search
- **Styling**: Tailwind CSS
- **Authentication**: iron-session with bcrypt
- **Web Scraping**: Cheerio for metadata extraction

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
cd synapse
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SESSION_SECRET=your_random_secret_at_least_32_characters_long
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Steps

1. Sign up for a new account
2. Click "Add to Synapse" to capture content
3. Try these examples:
   - Paste a YouTube URL: `https://youtube.com/watch?v=...`
   - Create a todo list:
     ```
     - Buy groceries
     - Call dentist
     - Finish report
     ```
   - Save a quote: `"The only way to do great work is to love what you do" - Steve Jobs`
   - Paste any article URL

4. Search your saved content using natural language:
   - "articles about AI"
   - "my todo lists"
   - "products under $500"

## Project Structure

```
synapse/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── items/        # Content CRUD operations
│   │   └── search/       # Semantic search
│   ├── auth/             # Login/signup pages
│   ├── dashboard/        # Main app interface
│   └── page.tsx          # Landing page
├── components/
│   ├── cards/            # Content type cards
│   │   ├── ArticleCard.tsx
│   │   ├── TodoCard.tsx
│   │   ├── YouTubeCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ImageCard.tsx
│   │   ├── QuoteCard.tsx
│   │   ├── NoteCard.tsx
│   │   └── ContentCard.tsx
│   ├── AddItemModal.tsx  # Add content modal
│   └── SearchBar.tsx     # Search interface
├── lib/
│   ├── db.ts             # SQLite database
│   ├── ai.ts             # Anthropic integration
│   ├── auth.ts           # Authentication utilities
│   ├── session.ts        # Session management
│   ├── scraper.ts        # URL metadata extraction
│   └── processor.ts      # Content processing
└── database.db           # SQLite database file
```

## How It Works

### Content Processing Pipeline

1. **Input Detection**: Automatically detects if input is a URL, text, or image
2. **Metadata Extraction**: 
   - For URLs: Scrapes title, description, images, Open Graph tags
   - For text: Analyzes content type (todo, quote, note, article)
   - For images: Stores as base64 data URL
3. **AI Processing**: Generates embeddings using Anthropic API for semantic search
4. **Storage**: Saves to SQLite with structured metadata
5. **Display**: Renders using appropriate card component

### Semantic Search

1. User enters natural language query
2. Query is converted to embedding using Anthropic API
3. Cosine similarity calculated against all stored embeddings
4. Results ranked by relevance score
5. Keyword matching provides additional boost
6. Top results displayed in visual cards

## Customization

### Adding New Content Types

1. Create a new card component in `components/cards/`
2. Add detection logic in `lib/processor.ts`
3. Update `ContentCard.tsx` switch statement
4. Add metadata extraction in `lib/scraper.ts` if needed

### Adjusting Search Behavior

Edit `lib/ai.ts`:
- `generateEmbedding()`: Modify embedding generation
- `semanticSearch()`: Adjust similarity algorithm
- `enhancedSearch()`: Tune keyword boosting

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `SESSION_SECRET`
3. Consider using a more robust database (PostgreSQL)
4. Add rate limiting and security headers
5. Deploy to Vercel, Railway, or any Node.js host

## Limitations (Prototype)

This is a prototype focused on core functionality:
- No user quotas or usage limits
- No real-time sync across devices
- No browser extension (manual input only)
- Simple embedding strategy (production should use dedicated embedding models)
- Basic authentication (no OAuth, 2FA)
- No file size limits or validation
- SQLite (not suitable for high-scale production)

## Future Enhancements

- Browser extension for one-click capture
- Mobile apps
- Collaborative features
- OCR for handwritten notes
- Advanced organization (tags, folders, collections)
- Export/import functionality
- Browser history integration
- Auto-capture from reading lists

## License

MIT

## Contributing

This is a prototype project. Feel free to fork and adapt for your needs!

