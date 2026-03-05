# Development Commands

## Core Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter (code quality check)
npm run lint
```

## System Commands (macOS/Darwin)
```bash
# File operations
ls -la          # List files with details
find . -name    # Find files by name
grep -r         # Search text in files

# Git operations
git status      # Check repository status
git add .       # Stage all changes
git commit -m   # Commit with message
git push        # Push to remote

# Process management
ps aux          # List running processes
kill -9 <pid>   # Force kill process
```

## Development Workflow
1. `npm run dev` - Start development
2. Make changes to code
3. `npm run lint` - Check code quality
4. `npm run build` - Test production build
5. Git commit and push changes

## Environment Setup
- Copy `.env.local.example` to `.env.local`
- Set `OPENAI_API_KEY` (required)
- Set `ANTHROPIC_API_KEY` (optional)
- Set `NEXT_PUBLIC_APP_URL` (optional)