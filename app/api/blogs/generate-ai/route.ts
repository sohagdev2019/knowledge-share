import { NextResponse } from "next/server";
import { requireUser } from "@/app/data/user/require-user";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    await requireUser();

    if (!env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const { topic, tone, length, category } = await request.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Build the prompt for blog generation
    const prompt = `Write a comprehensive blog post about "${topic}". 
${category ? `Category: ${category}. ` : ""}
${tone ? `Tone: ${tone}. ` : ""}
${length ? `Length: ${length}. ` : ""}

Please provide the blog in the following JSON format:
{
  "title": "A compelling, SEO-friendly title (max 100 characters)",
  "excerpt": "A brief, engaging excerpt/summary (2-3 sentences, max 500 characters)",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{"type": "text", "text": "Heading text"}]
      },
      {
        "type": "paragraph",
        "content": [{"type": "text", "text": "Paragraph text"}]
      }
    ]
  },
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoTitle": "SEO-optimized title (max 60 characters)",
  "seoDescription": "SEO meta description (max 160 characters)"
}

The "content" field must be a TipTap/ProseMirror JSON document structure. Use these node types:
- "doc" as the root (type: "doc", content: [array of nodes])
- "heading" with attrs: {level: 2 or 3} for headings
- "paragraph" for paragraphs
- "bulletList" and "listItem" for unordered lists
- "orderedList" and "listItem" for ordered lists
- "text" nodes for text content
- "bold" and "italic" marks for formatting (wrap text in marks array)

Example structure:
{
  "type": "doc",
  "content": [
    {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Introduction"}]},
    {"type": "paragraph", "content": [{"type": "text", "text": "This is a paragraph with ", "marks": [{"type": "bold"}]}, {"type": "text", "text": "bold text"}]}
  ]
}

Make sure the content is original, informative, and engaging. Return ONLY valid JSON, no markdown code blocks.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a cost-effective model
        messages: [
          {
            role: "system",
            content:
              "You are an expert blog writer. Always respond with valid JSON only, no additional text or markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error?.message ||
            "Failed to generate blog content. Please try again.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content generated. Please try again." },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let blogData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      blogData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error:
            "Failed to parse generated content. Please try again with a different topic.",
        },
        { status: 500 }
      );
    }

    // Validate content structure
    let contentJson = "";
    if (blogData.content && typeof blogData.content === "object") {
      // Content is already in JSON format
      contentJson = JSON.stringify(blogData.content);
    } else if (typeof blogData.content === "string") {
      // Fallback: create a simple paragraph structure from string
      contentJson = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: blogData.content,
              },
            ],
          },
        ],
      });
    } else {
      // Default empty structure
      contentJson = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "",
              },
            ],
          },
        ],
      });
    }

    // Validate and return the blog data
    return NextResponse.json({
      success: true,
      data: {
        title: blogData.title || "",
        excerpt: blogData.excerpt || "",
        content: contentJson,
        tags: Array.isArray(blogData.tags) ? blogData.tags : [],
        seoTitle: blogData.seoTitle || blogData.title?.substring(0, 60) || "",
        seoDescription:
          blogData.seoDescription || blogData.excerpt?.substring(0, 160) || "",
      },
    });
  } catch (error: any) {
    console.error("Error generating blog with AI:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}












