# AutoAbo Content Agent 🚗🤖

An AI agent that drafts Instagram posts for a **car subscription comparison platform**, using offer data from several providers and a human review step before publishing.

**Live demo:** [autoabo-content-agent.vercel.app](https://autoabo-content-agent.vercel.app/)

> Built as a portfolio project for a Werkstudent role at myAutoAbo. All providers and prices are fictional demo data.

![Screenshot of the app](public/screenshot.png)

## How it works

```
User enters a car
  → Agent checks: is this a car? (if not → rejected)
  → Tool: compare_car_offers → number of offers, cheapest price, shortest term
  → If the car has no offers → Tool: list_cars_with_offers → picks the most similar car
  → Agent writes a post using only numbers from the tools
  → Human reviews, edits and approves → copy to publish
```

## Features

- **Agent loop with tool calling:** the AI decides which tools to use and when
- **Two tools:** compare offers for a car, or find a similar car that has offers
- **No invented numbers:** all prices and terms come from the data, not the AI
- **Human in the loop:** posts can only be copied after a human approves them
- **Input protection:** rejects non-car inputs and very long inputs, tested against prompt injection
- **Visible agent steps:** the page shows which tools the agent called

## Design decisions

- **Built for a comparison platform.** I first built it like a rental company with its own cars. After researching myAutoAbo, I found out it compares offers from many providers, so I changed the project to match. The agent stays neutral and never recommends a specific provider.
- **Recommend instead of refuse.** If someone searches for a car without offers (for example the Golf), the agent suggests a similar car. In a company, revenue matters, so a "no" becomes a new chance to sell.
- **Human approval is required.** AI can make small mistakes. In testing, a post put "from 499 €" next to "terms from 3 months", but these were two different offers. A human reviewer catches things like this before publishing.
- **Code calculates, AI writes.** The cheapest price is calculated in code, not by the AI, because AI can get comparisons wrong.
- **AI judges, code decides.** The AI decides if the input is a car, but my code makes the final decision to reject it.
- **Gemini free tier.** I used Gemini because it is free. The AI call is in one function, so switching to another