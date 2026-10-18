# AutoAbo Content Agent 🚗🤖

An AI agent that drafts Instagram posts for a car subscription service, using real offer data and a human review step before publishing.

**Live demo:** [https://autoabo-content-agent.vercel.app/](https://autoabo-content-agent.vercel.app/)

> Built as a portfolio project for a Werkstudent role at a car subscription startup. Car data and prices are demo data.

## How it works

```
User enters a car
  → Agent checks: is this a car? (if not → rejected)
  → Tool: get_car_offer → real price, terms, availability
  → If not offered → Tool: list_available_cars → picks the most similar car
  → Agent writes a post using only numbers from the tools
  → Human reviews, edits and approves → copy to publish
```

## Features

- **Agent loop with tool calling**: the AI decides which tools to use and when
- **Two tools**: look up an offer, or find a similar available car (turns a "no" into a recommendation)
- **No invented numbers**: all prices and terms come from the data, not the AI
- **Human in the loop**: posts can only be copied after a human approves them
- **Input protection**: rejects non-car inputs and very long inputs; tested against prompt injection
- **Visible agent steps**: the UI shows which tools the agent called

## Design decisions

- **AI judges, code decides.** The AI classifies input and drafts text, but my code makes the final decisions (e.g. rejecting `NOT_A_CAR`).
- **Recommend instead of refuse.** For cars we don't offer, the agent suggests a similar one, because [your reason: revenue].
- **Human approval is enforced, not optional**, because [your reason].
- **Gemini free tier** to build at zero cost. The AI call lives in one function, so switching providers (e.g. to Claude) is a small change.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Google Gemini API · Vercel

## Run locally

```bash
npm install
# create .env.local with: GEMINI_API_KEY=your-key
npm run dev
```

## What I learned

- [Write 3–4 points in your own words, e.g. the TypeScript circular type error, rate limits, prompt injection]

## Next ideas

- Real database instead of demo data
- Rate limiting per user
- Generate posts for multiple platforms (Instagram, LinkedIn)