# Resume Enhancer

A Next.js web application that uses AI to analyze and enhance professional resumes against ATS (Applicant Tracking System) standards.

## Live Demo
Check out the live application: [https://resume-enhancer-rho.vercel.app/](https://resume-enhancer-rho.vercel.app/)

## Features
- **PDF & Text Input:** Upload a PDF resume or paste raw text.
- **Detailed Component Analysis:** Section-by-section breakdown (Summary, Experience, Skills, Education) with individual ATS scores.
- **AI Rewrites:** Highly optimized rewriting suggestions that preserve your original bullet point structure.
- **Export Options:** Download the analysis as a `.txt` report or instantly export the enhanced resume as a `.pdf`.
- **Modern UI:** Responsive, enterprise-grade design featuring integrated Dark and Light modes.

## Tech Stack
- **Frontend:** Next.js (App Router, React 19), Tailwind CSS
- **Backend API:** Node.js Serverless Route Handlers
- **AI Integration:** Groq SDK (`llama-3.1-70b-versatile`)
- **PDF Utilities:** `pdfjs-dist` (Text Extraction), `@react-pdf/renderer` (Document Generation)
- **Deployment:** Vercel

## System Architecture
1. **Frontend Input:** The React UI accepts a PDF or text via Client Components.
2. **Server-Side Extraction:** The raw PDF buffer is parsed server-side using `pdfjs-dist` to avoid client CPU blocking.
3. **AI Processing:** The Next.js `/api/enhance` route securely queries the Groq AI API leveraging Strict JSON mode ensuring strongly-typed parsing logic without API key leakage.
4. **Client-Side Export:** AI-generated JSON payloads dynamically build interactive dashboard components and render a downloadable PDF locally in the browser via `@react-pdf/renderer`.

## Setup & Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Guptasameer533/Resume_Enhancer.git
   cd resume-enhancer
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Design & Implementation Decisions
- **`pdfjs-dist` vs. `pdf-parse`:** Moved away from the unmaintained `pdf-parse` library due to Next.js Turbopack compilation issues and modern `XRef` parsing crashes.
- **Structured JSON Prompts:** Leveraging deterministic JSON-formatted AI output prevents fragile Markdown regex parsing, vastly stabilizing front-end React dashboard rendering.
- **Client PDF Generation:** Offloaded the final PDF rendering from the server directly to the browser to eliminate Vercel serverless function memory limits and network latency.

## Future Improvements
- **Advanced PDF Semantics:** Enhancing the initial extraction pipeline to accurately capture two-column structural text flow.
- **UI Streaming Responses:** Integrating Vercel AI SDK to stream JSON fragments for a better progressive loading experience.
- **Role Targets:** Allowing users to manually input a target "Job Title" so the AI explicitly refines bullet points around specific industry keywords.
