# AI Resume Enhancer

> An AI-powered web app that analyses your resume and returns section-by-section suggestions to improve language, structure, impact, and ATS-friendliness.

## Live Demo

<!-- TODO: Fill in after Vercel deployment (Stage 6) -->
**Live URL**: _coming soon_

## GitHub Repository

<!-- TODO: Add public repo URL -->
**Repo**: _coming soon_

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 14+ App Router (TypeScript) |
| Styling | Tailwind CSS |
| AI API | Groq — `llama-3.1-70b-versatile` |
| PDF Parsing | `pdf-parse` |
| Deployment | Vercel |

---

## Features

- Paste resume text or upload a PDF (drag-and-drop supported)
- AI-generated section-by-section feedback (Summary, Experience, Skills, Education, Formatting)
- Overall score + ATS compatibility score (0–100)
- Collapsible AI rewrite suggestion per section
- Character limit guard (15 000 chars), 3-second submit debounce
- Responsive dark-mode UI — works on desktop and mobile

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone <REPO_URL>
cd resume-enhancer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file at the project root:

```env
GROQ_API_KEY=<your-key-from-console.groq.com>
NEXT_PUBLIC_MAX_RESUME_CHARS=15000
```

Get your free API key at [console.groq.com](https://console.groq.com).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## API

### `POST /api/enhance`

**Request body**
```json
{ "resumeText": "string" }
```

**Success response (`200`)**
```json
{
  "result": {
    "overall_score": 74,
    "ats_score": 68,
    "sections": [
      {
        "name": "Summary",
        "score": 80,
        "strengths": ["..."],
        "improvements": ["..."],
        "rewrite_suggestion": "..."
      }
    ]
  }
}
```

---

## Design Decisions

- **Groq over OpenAI**: Free tier with fast inference (llama-3.1-70b-versatile) — ideal for a 2-day build.
- **Dynamic `pdf-parse` import**: The package uses DOM globals (`DOMMatrix`) that break Next.js Turbopack at build time. Importing it inside the handler function body prevents build-time evaluation.
- **Lazy Groq client**: The SDK singleton is initialised on the first request (not at module load) so `GROQ_API_KEY` is not required at build time.
- **No database / auth**: Resumes are analysed in-memory and never persisted — no privacy risk.
- **`serverExternalPackages: ["pdf-parse"]`**: Prevents Turbopack from bundling `pdf-parse` and triggering Node.js built-in conflicts.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Groq API key (server-only, never exposed to client) |
| `NEXT_PUBLIC_MAX_RESUME_CHARS` | Optional | Max characters allowed in textarea (default `15000`) |

---

## Deployment (Vercel)

1. Push code to a public GitHub repo
2. Import repo in [Vercel](https://vercel.com)
3. Add `GROQ_API_KEY` in **Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js

---

## License

MIT
