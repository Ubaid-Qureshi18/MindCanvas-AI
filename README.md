# ✦ MindCanvas AI — Visual Startup & Product Execution Platform

> Turn any startup or product idea into an executable, 3D interactive visual workspace powered by multi-model AI.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![ReactFlow](https://img.shields.io/badge/ReactFlow-xyflow-ff007a?style=flat-square)](https://reactflow.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🚀 Overview

**MindCanvas AI** is an AI-powered visual workspace for founders, product managers, and engineering leads. Give it a single line prompt (e.g. *"Launch an AI-powered legal document auditor"*), and MindCanvas automatically generates a complete **12-node strategic graph** covering:

1. **Problem Statement & Core Value Prop**
2. **Unique Solution & Product Positioning**
3. **Target ICP & User Personas**
4. **TAM / SAM / SOM Market Opportunity**
5. **Competitive Landscape & Moat Matrix**
6. **Technical Stack & Infrastructure Architecture**
7. **Business & Monetization Model**
8. **24-Month Revenue Projections & Unit Economics**
9. **90-Day GTM Execution Roadmap**
10. **Quantitative Risk & Threat Mitigation Scorecard**

---

## ✨ Key Features

- **✦ 3D Interactive Graph Canvas:** Built with ReactFlow (`@xyflow/react`) featuring smooth panning, zooming, 360px node cards, and animated smoothstep connection lines.
- **✦ AI Strategic Copilot:** Context-aware assistant that answers questions specifically for your canvas, generating financial P&L models, GTM channels, risk matrices, and pitch deck outlines.
- **✦ Canvas Readiness Audit Scorecard:** Real-time health audit evaluating canvas completeness across required strategic pillars with 1-click auto-fill.
- **✦ AI Scenario Simulator:** Stress-tests your startup strategy against market shifts, competitor moves, and economic downturns.
- **✦ Investor Pitch Deck Mode:** Converts your 12 canvas nodes into a 6-slide presentation deck formatted for VCs.
- **✦ Multi-Format Export:** Export your canvas to **Executive Markdown (.md)**, **HTML Briefings (.html)**, or **Raw JSON Data (.json)**.
- **✦ Enterprise Security & Auth:** 256-Bit SSL encrypted sign-in, password show/hide toggle, session persistence, and password reset flows.
- **✦ Responsive Across All Devices:** Optimized glassmorphism UI for desktop, tablet, and mobile displays.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| **Canvas Engine** | `@xyflow/react` (ReactFlow v12) |
| **Styling** | Modern CSS Tokens, Glassmorphism, 3D CSS Transforms |
| **Backend & API** | NestJS Node.js API / Next.js Server Actions |
| **Database & Storage** | Supabase PostgreSQL + LocalStorage Fallback |
| **Deployment** | Netlify / Vercel Ready |

---

## ⚙️ Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ubaid-Qureshi18/MindCanvas-AI.git
   cd MindCanvas-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` to launch the application.

---

## 🌐 Netlify Deployment Guide

MindCanvas AI is optimized for 1-click Netlify deployment.

1. Connect your GitHub repository `Ubaid-Qureshi18/MindCanvas-AI` to Netlify.
2. Set Build Command to:
   ```bash
   npm run build
   ```
3. Set Publish Directory to:
   ```bash
   apps/web/.next
   ```
4. Deploy! Netlify will automatically build and publish your site.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.

Developed with ❤️ by **Ubaid Qureshi**
