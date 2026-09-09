import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'DeepL API key not configured (DEEPL_API_KEY is missing).' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, targetLang = 'FR', sourceLang } = body;

    if (!text || (typeof text !== 'string' && !Array.isArray(text))) {
      return NextResponse.json(
        { error: 'Invalid or missing "text" field.' },
        { status: 400 }
      );
    }

    // Determine DeepL endpoint (free tier keys end with ':fx')
    const isFreeKey = apiKey.endsWith(':fx');
    const apiUrl = process.env.DEEPL_API_URL || (isFreeKey ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate');

    const isArray = Array.isArray(text);
    const textsToTranslate = isArray ? text : [text];

    // Avoid empty queries
    if (textsToTranslate.length === 0 || (textsToTranslate.length === 1 && !textsToTranslate[0].trim())) {
      return NextResponse.json({
        translated: text,
        translations: []
      });
    }

    const payload: Record<string, any> = {
      text: textsToTranslate,
      target_lang: targetLang.toUpperCase(),
      preserve_formatting: true,
    };

    if (sourceLang) {
      payload.source_lang = sourceLang.toUpperCase();
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown DeepL error');
      console.error('DeepL API error:', res.status, errorText);
      return NextResponse.json(
        { error: `DeepL API responded with ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const translations = data.translations || [];

    return NextResponse.json({
      translated: isArray ? translations.map((t: any) => t.text) : (translations[0]?.text || text),
      translations,
    });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Translation request failed' },
      { status: 500 }
    );
  }
}
