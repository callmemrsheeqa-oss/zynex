# ZYNEX – Personal Assistant Chatbot

> A modern, full-stack personal assistant web application powered by the Google Gemini API (`@google/genai`). Built with React, TypeScript, Tailwind CSS, Express, and Server-Sent Events (SSE) for low-latency streaming inference.

---

## 🌟 Overview

**ZYNEX** is an intelligent, professional personal assistant designed with a clean, distraction-free light theme interface. It provides multi-turn contextual conversations, code highlighting with one-click copy, response audio playback, multiple assistant personas, conversation export, and local browser persistence—all with an architecture that safeguards user credentials.

---

## ✨ Features

- **⚡ Real-Time Streaming Responses**: Responses stream token-by-token via Server-Sent Events (SSE), delivering lightning-fast conversational feedback.
- **🧠 Multi-Turn Context**: Remembers preceding dialogue turns within a conversation for natural follow-ups and complex troubleshooting.
- **🎨 Premium Light Theme UI**:
  - Crisp white and soft slate color palette with subtle indigo and blue accents.
  - Collapsible, responsive sidebar with active chat highlights and quick search.
  - Four curated suggestion cards for quick onboarding.
- **💻 Rich Markdown & Code Blocks**:
  - Full GitHub-Flavored Markdown (tables, blockquotes, bold/italic, lists).
  - Code blocks featuring language badges, monospace typography, and a 1-click **Copy Code** button with visual feedback.
- **🔊 Text-to-Speech (Listen)**: Built-in speech synthesis allowing users to listen to ZYNEX's responses aloud.
- **🔄 Retry & Stop Controls**: Retry any assistant response with the same conversational context, or stop generation in real time.
- **📁 Chat Management**:
  - Create new conversations with automatic smart title generation.
  - Rename, delete, or clear conversations at any time.
  - Export full conversation transcripts to nicely formatted Markdown files.
  - Saved locally in the browser (`localStorage`) for privacy and speed.
- **⚙️ Customizable Assistant Personas**:
  - **Balanced**: Clear, warm, and thorough explanations.
  - **Concise**: High-signal, executive brevity.
  - **Creative**: Imaginative angles, analogies, and inventive ideas.
  - **Technical**: Deep engineering rigor, best practices, and code accuracy.
  - **Custom Instructions**: Inject personal guidelines into ZYNEX's system instructions.
- **🔒 Enterprise-Grade Security**:
  - All Gemini API calls run strictly on the Node.js Express backend.
  - API keys are never exposed in client bundles or network requests to the browser.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons |
| **Markdown Engine** | Marked |
| **Backend Runtime** | Node.js + Express |
| **AI SDK** | Official Google Gen AI SDK (`@google/genai`) |
| **AI Models** | Gemini 3.1 Flash Lite (default, fast) and Gemini 3.8 Flash (optional, slower, deeper reasoning) |
| **Streaming Protocol** | Server-Sent Events (SSE) |
| **Build Tool** | Vite 8 + TSX |

---

## 📐 Project Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules (.env, node_modules, dist)
├── index.html                # HTML entry point with metadata and Google Fonts
├── metadata.json             # Project metadata (from Google AI Studio)
├── package.json              # NPM dependencies and build scripts
├── server.ts                 # Full-stack Express backend with Gemini SSE streaming
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── main.tsx              # React DOM entry point
    ├── App.tsx               # Main application container & state orchestration
    ├── index.css             # Tailwind v4 base styles, custom scrollbars & markdown
    ├── types/
    │   └── chat.ts           # TypeScript interfaces for messages, chats & settings
    ├── services/
    │   ├── api.ts            # Client-side SSE streaming & health-check client
    │   └── storage.ts        # LocalStorage persistence, title generator & export
    └── components/
        ├── Header.tsx        # Sticky top bar with status indicator & actions
        ├── Sidebar.tsx       # Collapsible conversation history & navigation
        ├── WelcomeView.tsx   # Hero welcome screen with 4 interactive prompt cards
        ├── ChatInput.tsx     # Auto-resizing input with Enter-to-send & stop controls
        ├── ChatMessage.tsx   # Chat bubble with copy, speech, and retry actions
        ├── MarkdownRenderer.tsx # Markdown parser with syntax-highlighted code blocks
        ├── SettingsModal.tsx # Persona, font size & custom instructions modal
        └── AboutModal.tsx    # App information and architecture modal
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or pnpm
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/zynex.git
cd zynex
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
copy .env.example .env
```

Open `.env` and configure your `GEMINI_API_KEY`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

> **Note**: The `.env` file stays on your computer only. It is listed in `.gitignore`, so it is never uploaded to GitHub.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### 5. Production Build

`npm run build` builds the frontend and bundles the server into `dist/server.js`. Then start it:

```bash
npm run build
npm start
```

---

## 🛡️ Security Notes

- **Never commit `.env` or secret keys**: The `.gitignore` file includes `.env*` to prevent accidental credential leakage.
- **Server-Side API Calls**: All interactions with `@google/genai` are handled inside `server.ts`. Client components only communicate with `/api/*` endpoints on the server.
- **No Mocking in Production**: ZYNEX communicates directly with live Gemini models. Ensure `GEMINI_API_KEY` has active quotas.

---

## 📄 License

This project is licensed under the Apache 2.0 License.
