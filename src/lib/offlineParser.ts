import { parseRelativeDate } from './dateParser';

export interface ParsedExpense {
  amount: number;
  item: string;
  date: Date;
}

export function parseExpenseOffline(text: string): ParsedExpense | null {
  // Remove common filler words and normalize
  const normalized = text.toLowerCase().trim();
  
  // Extract amount using various patterns
  const amountPatterns = [
    /\$(\d+(?:\.\d{2})?)/,           // $12.50
    /(\d+(?:\.\d{2})?) dollars?/,   // 12.50 dollars
    /(\d+(?:\.\d{2})?) bucks?/,     // 12 bucks
    /spent (\d+(?:\.\d{2})?)/,      // spent 12.50
    /paid (\d+(?:\.\d{2})?)/,       // paid 12.50
    /cost (\d+(?:\.\d{2})?)/,       // cost 12.50
    /(\d+(?:\.\d{2})?)/,            // fallback: any number
  ];
  
  let amount = 0;
  let amountMatch = null;
  
  for (const pattern of amountPatterns) {
    amountMatch = normalized.match(pattern);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
      break;
    }
  }
  
  if (amount <= 0) {
    return null;
  }
  
  // Extract item description
  let item = text;
  
  // Remove the matched amount and common expense words
  if (amountMatch) {
    item = item.replace(amountMatch[0], '').trim();
  }
  
  // Remove common expense-related words
  const wordsToRemove = [
    'i spent', 'spent', 'paid', 'cost', 'costs', 'costed',
    'bought', 'purchase', 'purchased', 'for', 'on', 'at',
    'dollars', 'dollar', 'bucks', 'buck', '$', 'money',
    'today', 'yesterday', 'this morning', 'this afternoon',
    'tonight', 'earlier', 'just', 'about', 'around'
  ];
  
  let cleanItem = item.toLowerCase();
  for (const word of wordsToRemove) {
    cleanItem = cleanItem.replace(new RegExp(`\\b${word}\\b`, 'gi'), ' ');
  }
  
  // Clean up spacing and capitalize
  cleanItem = cleanItem
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
  
  // Fallback if item is empty or too short
  if (!cleanItem || cleanItem.length < 2) {
    // Try to extract from original text patterns
    const itemPatterns = [
      /(?:for|on)\s+(.+?)(?:\s|$)/i,  // "for coffee" or "on lunch"
      /(.+?)\s+(?:cost|costs)/i,      // "coffee cost"
      /bought\s+(.+?)(?:\s|$)/i,      // "bought groceries"
    ];
    
    for (const pattern of itemPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 1) {
        cleanItem = match[1].trim().replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
  }
  
  // Final fallback
  if (!cleanItem || cleanItem.length < 2) {
    cleanItem = 'Unknown Item';
  }

  // Parse date from the original text
  const parsedDate = parseRelativeDate(text);
  
  return {
    amount,
    item: cleanItem,
    date: parsedDate
  };
}

// Simple categorization without AI
export function categorizeOffline(item: string): Record<string, boolean> {
  const itemLower = item.toLowerCase();
  
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
  
  // Simple keyword matching
  if (/grocery|supermarket|store|market|food shopping|walmart|target|costco/.test(itemLower)) {
    categories.is_grocery = true;
  } else if (/coffee|lunch|dinner|breakfast|restaurant|cafe|food|drink|beer|wine|snack|meal/.test(itemLower)) {
    categories.is_food_drink = true;
  } else if (/movie|cinema|theater|game|entertainment|concert|show|netflix|spotify/.test(itemLower)) {
    categories.is_entertainment = true;
  } else if (/bus|taxi|uber|lyft|gas|fuel|parking|train|subway|transport/.test(itemLower)) {
    categories.is_transportation = true;
  } else if (/shopping|clothes|clothing|shoes|electronics|amazon|purchase/.test(itemLower)) {
    categories.is_shopping = true;
  } else if (/electric|water|internet|phone|utility|bill|rent/.test(itemLower)) {
    categories.is_utilities = true;
  } else if (/doctor|medicine|pharmacy|hospital|health|medical/.test(itemLower)) {
    categories.is_healthcare = true;
  } else if (/school|book|course|education|tuition|class/.test(itemLower)) {
    categories.is_education = true;
  } else {
    categories.is_other = true;
  }
  
  return categories;
}