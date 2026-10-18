import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { findCarOffer, listAvailableCars } from "@/lib/cars";
export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.5-flash-lite";
//const MODEL = "gemini-3.8-flash";
const MAX_STEPS = 5;

const SYSTEM_INSTRUCTION =
  "You are the social media manager of myAutoAbo, a Berlin startup for car subscriptions. " +
  "You write short, friendly Instagram posts in German, using the informal 'du'. " +
  "Rules: maximum 120 words, 1-3 emojis, end with 3-5 hashtags. " +
  "If the user's input is clearly not a car (for example food, animals or random words), " +
  "do NOT call any tool and do NOT write a post. Reply with exactly: NOT_A_CAR " +
  "Otherwise, ALWAYS call get_car_offer first. " +
  "If the car is found and available, write the post about it. " +
  "If the car is not found, or found but not available, call list_available_cars, " +
  "pick the ONE most similar available car (same segment first, then similar fuel type and price), " +
  "and write a post recommending that car. You may mention the requested car as a hook " +
  "(for example 'Fan of the Golf?'), but never claim that we offer it. " +
  "Only use numbers that come from tool results. Never invent prices or other numbers.";

const carOfferTool = {
  type: "function" as const,
  name: "get_car_offer",
  description:
    "Looks up myAutoAbo's subscription offer for one car: segment, monthly price in EUR, " +
    "minimum term in months, included km per month, fuel type and availability. " +
    "Returns found: false if we don't offer this car.",
  parameters: {
    type: "object",
    properties: {
      car: { type: "string", description: "Car make and model, e.g. 'VW ID.4'" },
    },
    required: ["car"],
  },
};

const availableCarsTool = {
  type: "function" as const,
  name: "list_available_cars",
  description:
    "Lists all cars myAutoAbo can deliver right now, with segment, price, fuel type and terms. " +
    "Use it to find a similar alternative when the requested car is not found or not available.",
  parameters: {
    type: "object",
    properties: {},
  },
};

type FunctionResult = {
  type: "function_result";
  name: string;
  call_id: string;
  result: { type: "text"; text: string }[];
};

// Runs the tool the AI asked for. The AI never runs code itself: our code decides.
function runTool(name: string, args: Record<string, unknown>) {
  console.log(`[tool] ${name}`, args);

  if (name === "get_car_offer") {
    const offer = findCarOffer(String(args.car ?? ""));
    return offer ? { found: true, ...offer } : { found: false };
  }
  if (name === "list_available_cars") {
    return { cars: listAvailableCars() };
  }
  return { error: `Unknown tool: ${name}` };
}

// One request to the AI. All AI settings live here, in one place.
async function askAgent(input: string | FunctionResult[], previousId?: string) {
  return ai.interactions.create({
    model: MODEL,
    system_instruction: SYSTEM_INSTRUCTION,
    input,
    tools: [carOfferTool, availableCarsTool],
    previous_interaction_id: previousId,
    generation_config: { thinking_level: "low", max_output_tokens: 2048 },
  });
}

export async function POST(request: Request) {
  const { car } = await request.json();

  if (typeof car !== "string" || !car.trim()) {
    return NextResponse.json({ error: "Please enter a car." }, { status: 400 });
  }

  if (car.length > 60) {
    return NextResponse.json(
      { error: "That's too long for a car name. Please keep it under 60 characters." },
      { status: 400 }
    );
  }

  try {
    const toolCalls: string[] = [];
    let previousId: string | undefined = undefined;
    let nextInput: string | FunctionResult[] =
      `Write an Instagram post that makes people want to subscribe to the ${car}.`;

    // The agent loop: ask → run requested tools → send results back → repeat
    for (let i = 0; i < MAX_STEPS; i++) {
      const interaction = await askAgent(nextInput, previousId);
      console.log(`[agent] round ${i + 1}:`, interaction.steps?.map((s) => s.type));

      const results: FunctionResult[] = [];

      for (const step of interaction.steps ?? []) {
        if (step.type === "function_call") {
          const toolName = step.name ?? "";
          const result = runTool(toolName, step.arguments ?? {});
          toolCalls.push(`${toolName}(${JSON.stringify(step.arguments)})`);
          results.push({
            type: "function_result",
            name: toolName,
            call_id: step.id ?? "",
            result: [{ type: "text", text: JSON.stringify(result) }],
          });
        }
      }

      // No tool requests = the agent is done
      if (results.length === 0) {
        const text = (interaction.output_text ?? "").trim();

        if (text === "NOT_A_CAR") {
          return NextResponse.json(
            { error: `"${car}" doesn't look like a car. Please enter a car, e.g. VW ID.4.` },
            { status: 422 }
          );
        }

        return NextResponse.json({ post: text, toolCalls });
      }

      nextInput = results;
      previousId = interaction.id;
    }

    return NextResponse.json(
      { error: "The agent needed too many steps. Please try again." },
      { status: 500 }
    );
  } catch (error) {
    console.error(error);

    const status = (error as { status?: number }).status;
       if (status === 429) {
      return NextResponse.json(
        {
          error:
            "The AI's free usage limit is reached. It resets daily. " +
            "Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "The AI could not write a post. Please try again." },
      { status: 500 }
    );
  }
}