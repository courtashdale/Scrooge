export function parseRelativeDate(text: string, referenceDate: Date = new Date()): Date {
  const normalizedText = text.toLowerCase().trim();
  const today = new Date(referenceDate);
  today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
  
  // Handle "today" explicitly
  if (normalizedText.includes('today')) {
    return today;
  }
  
  // Handle "yesterday"
  if (normalizedText.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
  }
  
  // Handle "tomorrow"
  if (normalizedText.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }
  
  // Handle days of the week
  const daysOfWeek = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ];
  
  const shortDays = [
    'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  ];
  
  // Find day of week mentions
  let targetDay = -1;
  let isLast = false;
  let isNext = false;
  
  // Check for "last" or "next" modifiers
  if (normalizedText.includes('last ')) {
    isLast = true;
  } else if (normalizedText.includes('next ')) {
    isNext = true;
  }
  
  // Find the day
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (normalizedText.includes(daysOfWeek[i]) || normalizedText.includes(shortDays[i])) {
      targetDay = i;
      break;
    }
  }
  
  if (targetDay !== -1) {
    const currentDay = today.getDay();
    let daysToAdd;
    
    if (isLast) {
      // Last [day] - go back to previous occurrence
      if (targetDay === currentDay) {
        daysToAdd = -7; // Last occurrence of today is 7 days ago
      } else if (targetDay < currentDay) {
        daysToAdd = targetDay - currentDay - 7;
      } else {
        daysToAdd = targetDay - currentDay - 7;
      }
    } else if (isNext) {
      // Next [day] - go forward to next occurrence
      if (targetDay === currentDay) {
        daysToAdd = 7; // Next occurrence of today is 7 days from now
      } else if (targetDay > currentDay) {
        daysToAdd = targetDay - currentDay + 7;
      } else {
        daysToAdd = targetDay - currentDay + 7;
      }
    } else {
      // Just [day] - find the most recent occurrence (could be this week or last week)
      if (targetDay === currentDay) {
        daysToAdd = 0; // Today
      } else if (targetDay < currentDay) {
        daysToAdd = targetDay - currentDay; // Earlier this week (negative)
      } else {
        // Day hasn't occurred this week yet, so it was last week
        daysToAdd = targetDay - currentDay - 7;
      }
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate;
  }
  
  // Handle "X days ago"
  const daysAgoMatch = normalizedText.match(/(\d+)\s*days?\s*ago/);
  if (daysAgoMatch) {
    const daysAgo = parseInt(daysAgoMatch[1]);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysAgo);
    return targetDate;
  }
  
  // Handle "X days from now" or "in X days"
  const daysFromNowMatch = normalizedText.match(/(?:in\s*)?(\d+)\s*days?(?:\s*from\s*now)?/);
  if (daysFromNowMatch) {
    const daysFromNow = parseInt(daysFromNowMatch[1]);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysFromNow);
    return targetDate;
  }
  
  // Handle specific date formats (MM/DD, MM/DD/YY, MM/DD/YYYY)
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{2})/, // MM/DD/YY
    /(\d{1,2})\/(\d{1,2})/,          // MM/DD (current year)
  ];
  
  for (const pattern of datePatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const month = parseInt(match[1]) - 1; // JS months are 0-indexed
      const day = parseInt(match[2]);
      let year = today.getFullYear();
      
      if (match[3]) {
        year = parseInt(match[3]);
        if (year < 100) {
          year += year < 50 ? 2000 : 1900; // Assume 00-49 is 2000s, 50-99 is 1900s
        }
      }
      
      const targetDate = new Date(year, month, day, 12, 0, 0, 0);
      return targetDate;
    }
  }
  
  // Handle month names with day (e.g., "January 15", "Jan 15")
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const shortMonthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];
  
  for (let i = 0; i < monthNames.length; i++) {
    const monthPattern = new RegExp(`(${monthNames[i]}|${shortMonthNames[i]})\\s+(\\d{1,2})`, 'i');
    const match = normalizedText.match(monthPattern);
    if (match) {
      const day = parseInt(match[2]);
      const targetDate = new Date(today.getFullYear(), i, day, 12, 0, 0, 0);
      
      // If the date is in the future, assume it's from last year
      if (targetDate > today) {
        targetDate.setFullYear(today.getFullYear() - 1);
      }
      
      return targetDate;
    }
  }
  
  // If no date pattern found, return today
  return today;
}

// Helper function to format date for display
export function formatDateForDisplay(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}