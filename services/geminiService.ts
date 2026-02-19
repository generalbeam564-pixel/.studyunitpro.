
import { GoogleGenAI, Type } from "@google/genai";
import { StudyMaterial, PracticeQuestion, StudyPlanDay, Flashcard, QuizDifficulty, WeakSpotInsight, ChatMessage, UserTier } from "../types";

export const geminiService = {
  async processMaterial(material: StudyMaterial): Promise<{ summary: string; highPriorityTopics: string[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    let contents: any;
    if (material.type === 'image') {
      contents = {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: material.content.split(',')[1] } },
          { text: "Extract the main concepts from these study notes. Provide a concise summary and a list of 3-5 high-priority topics likely to be on an exam. Return as JSON with keys 'summary' and 'highPriorityTopics'." }
        ]
      };
    } else {
      contents = `Process this text from my study notes: "${material.content}". Provide a concise summary and a list of 3-5 high-priority topics likely to be on an exam. Return as JSON with keys 'summary' and 'highPriorityTopics'.`;
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            highPriorityTopics: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          propertyOrdering: ["summary", "highPriorityTopics"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text ? text.trim() : '{}');
  },

  async chatAssistant(
    history: ChatMessage[],
    message: string,
    materials: StudyMaterial[],
    tier: UserTier,
    difficulty: QuizDifficulty,
    userName: string
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const context = materials.length > 0 
      ? `You have access to the following study notes: ${materials.map(m => `Note: ${m.name}\nContent Summary: ${m.summary}`).join("\n\n")}`
      : "The user has not selected any specific study notes yet. Greet them and encourage them to select notes from their library.";

    const difficultyInstruction = {
      'Standard': "Keep explanations simple, clear, and focused on core basics. Avoid overly technical jargon.",
      'Challenger': "Use academic terminology and provide deeper context. Connect concepts to related theories.",
      'Expert': "Assume high-level mastery. Discuss complex relationships, edge cases, and critical analysis."
    }[difficulty];

    const systemInstruction = `You are the StudyUnitPro AI Assistant, an elite academic tutor.
Your user is ${userName}. Their subscription tier is ${tier}.
The current study difficulty is set to ${difficulty}. ${difficultyInstruction}

Goal: Help the user understand their material, answer questions, generate practice problems on demand, and summarize complex topics.
Style: Professional, encouraging, patient, and highly intelligent. Use Markdown for formatting (bolding, lists, etc.).

Context:
${context}`;

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that request.";
  },

  async processVoiceNote(transcript: string): Promise<{ refinedContent: string; summary: string; highPriorityTopics: string[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
      model,
      contents: `I recorded a voice note for my studies: "${transcript}". 
      1. Refine the transcript into clear, structured study notes (remove filler words, fix grammar).
      2. Provide a concise summary.
      3. Identify 3-5 high-priority exam topics.
      Return as JSON with keys 'refinedContent', 'summary', and 'highPriorityTopics'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedContent: { type: Type.STRING },
            summary: { type: Type.STRING },
            highPriorityTopics: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          propertyOrdering: ["refinedContent", "summary", "highPriorityTopics"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text ? text.trim() : '{}');
  },

  async generateQuiz(materials: StudyMaterial[], count: number = 5, difficulty: QuizDifficulty = 'Standard'): Promise<PracticeQuestion[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    const context = materials.map(m => m.summary).join("\n\n");
    
    const response = await ai.models.generateContent({
      model,
      contents: `Based on these concepts, create ${count} multiple-choice practice questions at a ${difficulty} difficulty level. Each question MUST have exactly 4 options. One option must be the correct answer. Include clear answers, short explanations, and assign each question a specific 'topic' name from the material. Format as JSON array of objects with keys: 'question', 'options' (array of 4 strings), 'answer' (the text of the correct option), 'explanation', 'topic' (a short string category). \n\nContext: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            propertyOrdering: ["question", "options", "answer", "explanation", "topic"]
          }
        }
      }
    });

    const text = response.text;
    return JSON.parse(text ? text.trim() : '[]');
  },

  async getWeakSpotInsights(topics: string[], materials: StudyMaterial[]): Promise<WeakSpotInsight[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const context = materials.map(m => m.summary).join("\n\n");

    const response = await ai.models.generateContent({
      model,
      contents: `A student is struggling with the following topics in their study material: ${topics.join(", ")}. 
      For each topic, provide:
      1. A brief AI-generated explanation of WHY it might be a weak spot based on the complexity of the material.
      2. A specific, actionable study method to improve mastery of that topic.
      Return as a JSON array of objects with keys: 'topic', 'explanation', 'studyMethod'. \n\nContext of material: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              explanation: { type: Type.STRING },
              studyMethod: { type: Type.STRING }
            },
            propertyOrdering: ["topic", "explanation", "studyMethod"]
          }
        }
      }
    });

    const text = response.text;
    return JSON.parse(text ? text.trim() : '[]');
  },

  async generateFlashcards(materials: StudyMaterial[]): Promise<Flashcard[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const context = materials.map(m => m.summary).join("\n\n");
    
    const response = await ai.models.generateContent({
      model,
      contents: `Create 10 AI-generated flashcards based on these study materials. Focus on key definitions, concepts, and facts. Format as JSON array of objects with keys: 'front' (the question or term) and 'back' (the answer or definition). \n\nContext: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            propertyOrdering: ["front", "back"]
          }
        }
      }
    });

    const text = response.text;
    return JSON.parse(text ? text.trim() : '[]');
  },

  async generateStudyPlan(
    materials: StudyMaterial[], 
    examDate: string, 
    dailyTime: number
  ): Promise<StudyPlanDay[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    const topics = materials.flatMap(m => m.highPriorityTopics || []).join(", ");
    const daysUntilExam = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const response = await ai.models.generateContent({
      model,
      contents: `I have an exam on ${examDate} (${daysUntilExam} days from now). I can study ${dailyTime} minutes per day. My topics are: ${topics}. Generate a daily study plan for the next 7 days. Focus on high priority items. Format as a JSON array of objects with keys: 'date', 'tasks' (array of strings), 'duration' (number in minutes).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              tasks: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              duration: { type: Type.NUMBER }
            },
            propertyOrdering: ["date", "tasks", "duration"]
          }
        }
      }
    });

    const text = response.text;
    const planData = JSON.parse(text ? text.trim() : '[]');
    return planData.map((day: any) => ({ 
      ...day, 
      completed: false, 
      taskStatus: day.tasks.map(() => false) 
    }));
  }
};
