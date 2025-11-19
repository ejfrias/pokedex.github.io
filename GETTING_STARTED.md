# Getting Started with Your Pokédex

## Quick Start

Your Pokédex is ready! Here's how to use it:

### 1. View Your Current Pokédex

The app is currently running at: **http://localhost:3000**

You currently have **27 Pokémon** loaded (Bulbasaur through Sandslash).

### 2. Fetch More Pokémon

#### Option A: Complete Gen 1 (151 Pokémon)

```bash
cd ~/Development/ejsfrias/pokedex
npm run crawl
npm run generate-index
```

This takes about 15-20 minutes.

#### Option B: All Pokémon (1328+)

```bash
cd ~/Development/ejsfrias/pokedex
npm run crawl:all
npm run generate-index
```

This takes about 2-3 hours due to rate limiting.

### 3. View Your Site

After crawling more data:

1. Refresh your browser at http://localhost:3000
2. You'll see all newly crawled Pokémon in the grid

## Features Demo

### Homepage

- **Search bar**: Try searching for "pika", "fire", or "001"
- **Grid view**: Click any Pokémon card to see details
- **Type filtering**: Search by type like "grass" or "poison"

### Pokémon Detail Page

- **Stats section**: Visual progress bars for all stats
- **Type effectiveness**: See weaknesses, resistances, and immunities
- **Evolution chain**: Click to navigate between evolution forms
- **Locations**: Accordion showing where to catch per game
- **Moves**: Tabs for Level-up vs TM/HM moves by generation

## File Structure

```
data/
├── pokemon/          # Individual Pokémon JSON files
│   ├── 1.json       # Bulbasaur
│   ├── 2.json       # Ivysaur
│   └── ...
└── index.json        # Lightweight index for search/grid
```

## Development Workflow

### Making Changes

1. **Edit components** in `components/`
2. **Edit pages** in `app/`
3. **Hot reload** is automatic - just save!

### Testing

```bash
# Development mode (with hot reload)
npm run dev

# Production build (test performance)
npm run build
npm start
```

### Adding Features

Common enhancements:

- **Dark mode**: Add theme provider
- **Favorites**: Add localStorage persistence
- **Type calculator**: Create damage calculation tool
- **Comparison**: Side-by-side Pokémon comparison
- **Move details**: Fetch move data from PokeAPI

## Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Fetch all data
npm run crawl:all
npm run generate-index

# 2. Test production build
npm run build

# 3. Deploy
npx vercel deploy --prod
```

Your site will be live at `https://your-pokedex.vercel.app`

### Environment Variables (Optional)

Create `.env.local` for any API keys:

```
NEXT_PUBLIC_SITE_NAME="My Pokédex"
```

## Troubleshooting

### Images Not Loading

- Check `next.config.ts` has the correct image domains
- Server should auto-reload after config changes

### No Pokémon Showing

- Run `npm run generate-index` after crawling
- Check `data/index.json` exists and has content

### Build Errors

- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`
- Ensure all Pokémon JSON files are valid

### Crawler Issues

- PokeAPI might be slow - be patient
- Check your internet connection
- Rate limiting is intentional (100ms between requests)

## Tips

1. **Start small**: Test with 27 Pokémon first before crawling all
2. **Incremental crawling**: You can stop/restart the crawler - it won't overwrite
3. **Performance**: Static generation means instant page loads
4. **SEO**: All pages are pre-rendered HTML
5. **Mobile-first**: Layout automatically adapts to screen size

## Next Steps

- ✅ You have a working Pokédex with 27 Pokémon
- 🔄 Optionally crawl more Pokémon
- 🎨 Customize colors in `app/globals.css`
- 🚀 Deploy to Vercel when ready
- 📱 Test on mobile devices

Enjoy your Pokédex! 🎮
