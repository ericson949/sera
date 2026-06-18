import { NextResponse } from "next/server";
import { z } from "zod";
import { captureServerException } from "@/shared/observability/posthogServer";

const inputSchema = z.object({
  mealTitle: z.string().min(1),
});

const AI_TIMEOUT_MS = 45_000; // Image generation can take slightly longer

export async function POST(request: Request) {
  try {
    const { mealTitle } = inputSchema.parse(await request.json());
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is not configured" }, { status: 400 });
    }

    const model = process.env.OPENROUTER_IMAGE_MODEL ?? "black-forest-labs/flux-1-schnell";
    const prompt = `Premium Mediterranean food photography, close-up, delicious looking, professional lighting, editorial style, showing: ${mealTitle}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://sera.menu",
          "X-Title": "Sera",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image"],
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenRouter image generation failed: ${response.status} ${await response.text()}`);
      }

      const data = await response.json();
      
      // OpenRouter returns generated images in choices[0].message.images array
      const images = data.choices?.[0]?.message?.images;
      let imageUrl = "";

      if (images && images.length > 0) {
        imageUrl = images[0]?.image_url?.url || "";
      } else {
        // Fallback: search for base64 data URL in markdown content if returned as text
        const content = data.choices?.[0]?.message?.content || "";
        const match = content.match(/data:image\/[a-zA-Z]+;base64,[a-zA-Z0-9+/=]+/);
        if (match) {
          imageUrl = match[0];
        }
      }

      if (!imageUrl) {
        throw new Error("No image was returned from OpenRouter");
      }

      return NextResponse.json({ imageUrl });
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (error) {
    console.error("Image generation route failed:", error);
    await captureServerException(error, { route: "/api/generate-image", provider: "openrouter", fallback: "none" });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate image" }, { status: 500 });
  }
}
