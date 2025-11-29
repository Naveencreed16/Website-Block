import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FilterLevel, SafetyCategory } from "../types";

const apiKey = process.env.API_KEY || "";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const analyzeContent = async (
  text: string,
  filterLevel: FilterLevel
): Promise<AnalysisResult> => {
  if (!text || !text.trim()) {
    throw new Error("Content is empty");
  }

  // Construct a prompt based on filter level
  let systemInstruction = "You are a content moderation AI. Your goal is to analyze text for 18+, explicit, violent, or hateful content.";
  
  if (filterLevel === FilterLevel.STRICT) {
    systemInstruction += " You must be extremely strict. Flag any hint of impropriety, including mild profanity or suggestive themes.";
  } else if (filterLevel === FilterLevel.MODERATE) {
    systemInstruction += " Be balanced. Flag explicit adult content, severe violence, and hate speech. Allow mild slang or non-explicit context.";
  } else {
    // If OFF, we technically just return safe, but for the 'Analyzer' demo we still run the check to show what *would* happen.
    systemInstruction += " Analyze objectively without filtering, but accurately label the content categories.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following text: "${text}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN, description: "Whether the content is considered safe based on standard community guidelines." },
            score: { type: Type.NUMBER, description: "A safety score from 0 (very unsafe) to 100 (completely safe)." },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of categories detected: 'Adult Content', 'Violence', 'Hate Speech', 'Profanity', or 'Safe'."
            },
            reasoning: { type: Type.STRING, description: "A brief explanation of why the content was flagged or marked safe." },
            flaggedPhrases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific words or phrases that triggered the filter."
            }
          },
          required: ["isSafe", "score", "categories", "reasoning", "flaggedPhrases"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(resultText);

    // Map string categories to enum if needed, or trust the AI output if it matches
    const mappedCategories = data.categories.map((c: string) => {
        // Simple normalization
        if (c.toLowerCase().includes('adult') || c.toLowerCase().includes('sexual')) return SafetyCategory.ADULT;
        if (c.toLowerCase().includes('violen')) return SafetyCategory.VIOLENCE;
        if (c.toLowerCase().includes('hate')) return SafetyCategory.HATE_SPEECH;
        if (c.toLowerCase().includes('profan')) return SafetyCategory.PROFANITY;
        return SafetyCategory.SAFE;
    }).filter((c: SafetyCategory) => c !== SafetyCategory.SAFE); // Remove 'Safe' from the flagged list for internal logic

    // If array is empty but isSafe is false, default to Adult or Unknown
    if (!data.isSafe && mappedCategories.length === 0) {
        mappedCategories.push(SafetyCategory.ADULT);
    }

    return {
      isSafe: data.isSafe,
      score: data.score,
      categories: mappedCategories.length > 0 ? mappedCategories : [SafetyCategory.SAFE],
      reasoning: data.reasoning,
      flaggedPhrases: data.flaggedPhrases || []
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback error result
    return {
      isSafe: false,
      score: 0,
      categories: [],
      reasoning: "Failed to analyze content due to an API error.",
      flaggedPhrases: []
    };
  }
};
