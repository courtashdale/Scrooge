import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expense parser. Given a text about an expense, extract and return ONLY a JSON object with "amount" (number) and "item" (string, 2-4 words describing what was purchased). The item should be a clean, concise description.

Examples:
- "I spent $15 on lunch at a cafe" → {"amount": 15, "item": "lunch at cafe"}
- "Paid $25.50 for groceries" → {"amount": 25.50, "item": "groceries"}
- "$8 coffee this morning" → {"amount": 8, "item": "coffee"}
- "Bus fare was $3.25" → {"amount": 3.25, "item": "bus fare"}

Return ONLY the JSON object, no explanation.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 50,
      temperature: 0,
    });

    const response = completion.choices[0].message.content?.trim();
    
    try {
      const parsed = JSON.parse(response || '{}');
      
      if (!parsed.amount || !parsed.item) {
        return NextResponse.json({ 
          error: 'Could not parse amount or item from text' 
        }, { status: 400 });
      }
      
      return NextResponse.json({
        amount: parseFloat(parsed.amount),
        item: parsed.item
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      return NextResponse.json({ 
        error: 'Failed to parse expense information' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Expense parsing error:', error);
    return NextResponse.json({ error: 'Parsing failed' }, { status: 500 });
  }
}