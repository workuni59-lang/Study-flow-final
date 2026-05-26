/**
 * AI Timetable Architect Service
 * COOLDOWN-READY VERSION
 * Direct, single handshake to preserve quota.
 */

export interface AIPlanResponse {
  subjects: {
    name: string;
    topics: string[];
    color: string;
  }[];
  tasks: {
    title: string;
    category: string;
    priority: 'High Yield' | 'Deep Review' | 'Standard';
    daysFromToday: number;
  }[];
}

export const generateStudyPlan = async (
  apiKey: string,
  syllabus: string,
  examDate: string,
  studyHours: number
): Promise<AIPlanResponse> => {
  const cleanKey = apiKey.trim();
  const modelId = "gemini-1.5-flash";
  const version = "v1"; // Stable production version

  const prompt = `
    Generate a study plan JSON for the following:
    Syllabus: ${syllabus}
    Exam Date: ${examDate}
    Study Hours: ${studyHours}h/day
    Today: ${new Date().toISOString().split('T')[0]}

    Return ONLY a valid JSON object.
    {
      "subjects": [{ "name": "...", "topics": ["..."], "color": "indigo" }],
      "tasks": [{ "title": "...", "category": "...", "priority": "High Yield", "daysFromToday": 0 }]
    }
  `;

  try {
    console.log(`[AI Cooldown] Direct handshake with ${modelId}...`);
    const url = `https://generativelanguage.googleapis.com/${version}/models/${modelId}:generateContent?key=${cleanKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.1,
          maxOutputTokens: 1500
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
         const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
         return JSON.parse(cleanJson) as AIPlanResponse;
      }
      throw new Error("AI returned empty content.");
    } else {
       const msg = data.error?.message || "Connection Error";
       if (response.status === 429) {
         throw new Error("QUOTA_LOCK"); // Special key for UI cooldown
       }
       throw new Error(msg);
    }
  } catch (err: any) {
    throw err;
  }
};
