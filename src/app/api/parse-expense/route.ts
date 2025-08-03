import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { parseRelativeDate } from '@/lib/dateParser';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    logger.info({ text }, 'Parsing expense');

    if (!text) {
      logger.warn('Text is required');
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expense parser. Given a text about an expense, extract and return ONLY a JSON object with "amount" (number), "item" (string, 2-4 words describing what was purchased), and "dateText" (string, any date/time reference mentioned or null if none).

Examples:
- "I spent $15 on lunch at a cafe yesterday" → {"amount": 15, "item": "lunch at cafe", "dateText": "yesterday"}
- "Paid $25.50 for groceries on Wednesday" → {"amount": 25.50, "item": "groceries", "dateText": "Wednesday"}
- "$8 coffee this morning" → {"amount": 8, "item": "coffee", "dateText": "this morning"}
- "Bus fare was $3.25" → {"amount": 3.25, "item": "bus fare", "dateText": null}
- "I bought gas for $45 last Tuesday" → {"amount": 45, "item": "gas", "dateText": "last Tuesday"}

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
    logger.info({ response }, 'Parsed expense from AI');
    
    try {
      const parsed = JSON.parse(response || '{}');
      
      if (!parsed.amount || !parsed.item) {
        logger.warn('Could not parse amount or item from text');
        return NextResponse.json({ 
          error: 'Could not parse amount or item from text' 
        }, { status: 400 });
      }
      
      // Parse the date if provided
      let parsedDate = new Date(); // Default to today
      if (parsed.dateText) {
        parsedDate = parseRelativeDate(parsed.dateText);
      }
      
      return NextResponse.json({
        amount: parseFloat(parsed.amount),
        item: parsed.item,
        date: parsedDate.toISOString()
      });
    } catch (parseError) {
      logger.error({ response, parseError }, 'Failed to parse AI response');
      return NextResponse.json({ 
        error: 'Failed to parse expense information' 
      }, { status: 500 });
    }
  } catch (error) {
    logger.error(error, 'Expense parsing error');
    return NextResponse.json({ error: 'Parsing failed' }, { status: 500 });
  }
}