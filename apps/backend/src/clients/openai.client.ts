import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export default openaiClient;
