import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { item } = await request.json();

    if (!item) {
      return NextResponse.json({ error: 'Item is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expense categorizer. Given an item, return ONLY the category name from this list: grocery, entertainment, transportation, food_drink, shopping, utilities, healthcare, education, other. Return only one word, no explanation.`
        },
        {
          role: 'user',
          content: `Categorize this expense item: ${item}`
        }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const category = completion.choices[0].message.content?.trim().toLowerCase();
    
    const categories = {
      is_grocery: false,
      is_entertainment: false,
      is_transportation: false,
      is_food_drink: false,
      is_shopping: false,
      is_utilities: false,
      is_healthcare: false,
      is_education: false,
      is_other: false,
    };

    // Set the appropriate category to true
    const categoryKey = `is_${category}` as keyof typeof categories;
    if (categoryKey in categories) {
      categories[categoryKey] = true;
    } else {
      categories.is_other = true;
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json({ error: 'Categorization failed' }, { status: 500 });
  }
}