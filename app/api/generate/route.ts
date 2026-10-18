import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const { car } = await request.json();

  if (typeof car !== "string" || !car.trim()) {
    return NextResponse.json({ error: "Please enter a car." }, { status: 400 });
  }

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction:
        "You are the social media manager of myAutoAbo, a Berlin startup for car subscriptions. " +
        "You write short, friendly Instagram posts in German, using the informal 'du'. " +
        "Rules: maximum 120 words, 1-3 emojis, end with 3-5 hashtags. " +
        "Never invent technical numbers like range, price or horsepower. If you are not sure, do not mention them.",
      input: `Write an Instagram post that makes people want to subscribe to the ${car}.`,
      generation_config: {
        thinking_level: "low",
        max_output_tokens: 2048,
      },
    });

    return NextResponse.json({ post: interaction.output_text ?? "" });
  } catch (error) {
    console.error(error);

    const status = (error as { status?: number }).status;
    if (status === 429) {
      return NextResponse.json(
        { error: "Free limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "The AI could not write a post. Please try again." },
      { status: 500 }
    );
  }
}