# Resume Enhancer
A professional, AI-powered resume analysis and optimization tool that evaluates ATS compatibility and intelligently rewrites your bullet points. It helps job seekers instantly identify structural weaknesses in their resumes and provides highly polished, metric-driven rewriting suggestions tailored to pass automated screening systems.

### Live Demo
[Vercel Deployment URL Pending]

### Features
* **PDF & Text Support:** Seamlessly upload a PDF file or paste your raw text for instant analysis.
* **Component-Level Analysis:** Breaks down your resume into distinct sections, scoring each individually.
* **Intelligent Feedback:** Provides granular lists of what is working (strengths) and what needs improvement per section.
* **AI Rewrites & Comparison:** Generates a highly optimized rewrite for each section with an interactive toggle to compare the AI's version against your original text.
* **Dual Export:** Export your complete diagnostic report as a `.txt` file, or instantly download the enhanced, rewritten version as a new `.pdf` file.
* **Premium Glassmorphism UI:** Features a high-contrast, responsive enterprise SaaS aesthetic with seamless Light/Dark mode support.

### Tech Stack
* **Framework:** Next.js (App Router, React 19)
* **Styling:** Tailwind CSS (v4)
* **AI API:** Groq SDK (`llama-3.1-70b-versatile`)
* **PDF Parsing:** `pdfjs-dist` (Mozilla)
* **PDF Generation:** `@react-pdf/renderer`
* **Deployment Platform:** Vercel

### Setup Instructions
1. `git clone https://github.com/Guptasameer533/Resume_Enhancer.git`
2. `cd resume-enhancer`
3. `npm install`
4. Create `.env.local` with `GROQ_API_KEY=your_key`
5. `npm run dev`
6. Open `http://localhost:3000`

### AI Integration
The application interfaces via the Groq SDK with the `llama-3.1-70b-versatile` model, strictly enforcing a predefined JSON output using the `response_format: { type: "json_object" }` parameter. The prompt explicitly casts the persona of an expert technical recruiter, instructing the LLM to process the raw input and map it definitively into an expected TypeScript interface. The resulting JSON payload guarantees structured access to deeply nested data, including a global `ats_score`, an `overall_score`, and an array of `sections`, each strictly maintaining its `original_text`, arrays of `strengths` and `improvements`, and a final `rewrite_suggestion`.

### Design Decisions
* **Server-Side AI Proxies over Client Fetches:** The Groq API interaction was abstracted into a dedicated Next.js Route Handler (`/api/enhance`). This inherently prevents the exposure of the sensitive `GROQ_API_KEY` to the client browser while allowing the backend to execute heavy JSON validation.
* **Structured JSON over Free Text:** Instead of asking the LLM to return markdown, we forced a strict JSON schema. This unblocks the deterministic rendering of React dashboard components, SVG gauges, and arrays of interactive cards without relying on fragile regex string parsing.
* **`pdfjs-dist` over Deprecated Parsers:** While `pdf-parse` is the industry standard for lightweight extraction, it violently crashed the modern Next.js Turbopack environment and aggressively threw `bad XRef entry` errors on dynamically generated PDFs. We explicitly pivoted to Mozilla's `pdfjs-dist` to parse raw page streams reliably in Node.js.
* **Client-Side PDF Architecture:** Opted to use `@react-pdf/renderer` dynamically on the client (`ssr: false`) rather than generating PDFs on the Next.js edge. This eliminates server-side memory bloat and font-loading network latency, providing a perfectly instant download experience directly in the browser engine.

### What I Would Improve
* **Multi-Column PDF Semantic Parsing:** Currently, standard PDF parsers read text physically from left to right. If a user uploads a heavy two-column resume design, the semantic parsing sometimes jumbles dates and descriptions in the raw text string before the AI even sees it.
* **Streaming Generation UI:** The current `/api/enhance` route waits for the full JSON payload before returning. Implementing the Vercel AI SDK to stream the JSON chunks to the client would provide a much faster perceived loading experience instead of a static loading spinner.
* **Custom Persona Injector:** Allowing the user to pass a specific Job Description or Role (e.g., "Product Manager" vs "DevOps Engineer") so the AI heavily anchors its rewrites against precise industry keywords rather than general best-practices.
