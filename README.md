# SemesterFlow - Study Session Tracker

A modern, AI-powered study session tracker designed to help students manage their coursework, assignments, and study time effectively.

## Features

- **Course Management** - Track all your courses with customizable colors and details
- **Assignment Tracking** - Manage deadlines, priorities, and completion status
- **Study Timer** - Built-in Pomodoro timer with session tracking
- **AI-Powered Insights** - Get study recommendations and analyze your learning patterns
- **Knowledge Base** - Save and organize important study notes
- **Analytics Dashboard** - Visualize your study habits and productivity
- **Export/Import** - CSV support for data portability

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Neo-brutalist design)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Supabase account (free tier available)
- Google AI API key (optional, for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/semesterflow.git
   cd semesterflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key (optional)
   ```

4. Set up the database:
   - Go to your Supabase project
   - Run the SQL in `supabase_schema.sql` in the SQL Editor

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:5173 in your browser

## Project Structure

```
semesterflow/
├── components/          # React components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── services/           # API and database services
├── utils/              # Utility functions
├── mcp-server/         # Model Context Protocol server
├── server/             # Backend server (Gemini API proxy)
├── App.tsx             # Main app component
├── types.ts            # TypeScript type definitions
└── constants.ts        # App constants
```

## Key Components

- **AuthContext** - User authentication and session management
- **CoursesContext** - Course data and operations
- **AssignmentsContext** - Assignment management
- **SessionsContext** - Study session tracking
- **StatsContext** - Analytics and statistics

## Database Schema

The app uses Supabase with the following tables:
- `courses` - Course information
- `assignments` - Assignment details and deadlines
- `study_sessions` - Recorded study sessions
- `knowledge_base` - Saved notes and insights

See `supabase_schema.sql` for the complete schema.

## MCP Server

SemesterFlow includes a Model Context Protocol (MCP) server that allows AI assistants to interact with your study data.

### Setup MCP Server

```bash
cd mcp-server
npm install
npm run build
npm start
```

See [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md) for detailed setup instructions.

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Monitoring & Code Quality

This project uses automated monitoring and code review tools:

- **CodeRabbit** - Automated PR reviews
- **Sentry** - Error tracking and monitoring
- **GitHub Actions** - CI/CD workflows

See [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md) for setup instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with React and TypeScript
- Powered by Supabase and Google Gemini
- Inspired by the need for better student productivity tools

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy studying!** 📚✨
