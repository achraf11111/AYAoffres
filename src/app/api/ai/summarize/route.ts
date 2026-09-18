import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, lang } = await req.json();

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { summary: "⚠️ API Key not found. Please add OPENROUTER_API_KEY to your .env.local file." },
        { status: 200 }
      );
    }

    let prompt = "";
    if (lang === 'ar') {
      prompt = `لخص طلب العروض التالي في جملتين مفيدتين باللغة العربية، مع التركيز على نوع العمل والمكان: "${text}"`;
    } else if (lang === 'en') {
      prompt = `Summarize the following tender in 2 sentences in English, focusing on the type of work and location: "${text}"`;
    } else {
      prompt = `Résume l'appel d'offres suivant en 2 phrases en français, en te concentrant sur le type de travaux et le lieu : "${text}"`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: "system", content: "You are an assistant that summarizes public tenders clearly and concisely." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ summary: data.choices[0].message.content });
    } else {
      throw new Error("Invalid response from OpenRouter");
    }

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ summary: "❌ Failed to connect to AI service. Please try again." }, { status: 500 });
  }
}
