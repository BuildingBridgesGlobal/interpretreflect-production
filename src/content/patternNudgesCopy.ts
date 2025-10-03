/**
 * Pattern Detection UX Microcopy Library
 * Supportive, actionable nudges based on user behavior patterns
 */

export interface NudgeCopyVariation {
  id: string;
  category: string;
  variations: {
    title: string;
    message: string;
    action?: string;
  }[];
  tone: 'supportive' | 'encouraging' | 'gentle' | 'motivating' | 'celebratory';
  context: string;
}

/**
 * UX Microcopy Variations for Pattern-Based Nudges
 * Each pattern can have multiple copy variations to prevent repetition
 */
export const NUDGE_COPY_LIBRARY: NudgeCopyVariation[] = [
  // Assignment-Related Patterns
  {
    id: 'medical-fatigue',
    category: 'assignment-stress',
    tone: 'supportive',
    context: 'User consistently feels drained after medical assignments',
    variations: [
      {
        title: 'Pattern Noticed',
        message: 'You often feel drained after medical assignments. Try the Professional Boundaries Reset after your next one.',
        action: 'Set Boundary Reminder'
      },
      {
        title: 'Medical Assignment Care',
        message: 'Medical interpreting takes a toll. A quick emotional reset after these sessions could help you bounce back faster.',
        action: 'Try 2-Min Reset'
      },
      {
        title: 'Your Wellness Insight',
        message: 'Data shows medical assignments impact your energy. Consider scheduling lighter tasks afterward when possible.',
        action: 'View Pattern Details'
      }
    ]
  },

  {
    id: 'legal-anxiety',
    category: 'assignment-stress',
    tone: 'supportive',
    context: 'User experiences anxiety before legal/court assignments',
    variations: [
      {
        title: 'Pre-Court Preparation',
        message: 'Legal assignments tend to make you anxious. Try the Confidence Boost meditation 30 minutes before your next one.',
        action: 'Bookmark Meditation'
      },
      {
        title: 'Court Day Support',
        message: 'We noticed court days are challenging. A morning grounding exercise might help you feel more centered.',
        action: 'Morning Routine'
      },
      {
        title: 'Legal Assignment Tip',
        message: 'Your stress peaks before legal assignments. Consider arriving 10 minutes early for a calming breathwork session.',
        action: 'Learn Technique'
      }
    ]
  },

  {
    id: 'education-overwhelm',
    category: 'assignment-stress',
    tone: 'gentle',
    context: 'User feels overwhelmed with education/school assignments',
    variations: [
      {
        title: 'School Assignment Support',
        message: 'Education settings seem overwhelming lately. The Sensory Reset can help manage classroom stimulation.',
        action: 'Try Sensory Reset'
      },
      {
        title: 'Classroom Wellness',
        message: 'Long school days affecting you? Mini-breaks between classes can make a big difference.',
        action: 'Set Break Reminders'
      }
    ]
  },

  // Time-Based Patterns
  {
    id: 'monday-stress',
    category: 'time-patterns',
    tone: 'encouraging',
    context: 'User consistently stressed on Mondays',
    variations: [
      {
        title: 'Monday Mindfulness',
        message: 'Mondays tend to be stressful for you. Start with 5 minutes of morning breathwork to set a calmer tone.',
        action: 'Try Breathwork'
      },
      {
        title: 'Case of the Mondays?',
        message: 'Your Monday stress is real and valid. A Sunday evening prep routine might ease the transition.',
        action: 'Sunday Planning Guide'
      },
      {
        title: 'Monday Reset',
        message: 'Let\'s make Mondays better. Data shows a morning reset helps you handle Monday challenges 40% better.',
        action: 'Monday Morning Reset'
      }
    ]
  },

  {
    id: 'afternoon-dip',
    category: 'time-patterns',
    tone: 'motivating',
    context: 'User experiences afternoon energy crashes',
    variations: [
      {
        title: 'Afternoon Energy Boost',
        message: 'Your energy often dips around 3 PM. A 5-minute walk or stretching session could help you power through.',
        action: 'Set Daily Reminder'
      },
      {
        title: '3 PM Slump?',
        message: 'That afternoon crash is predictable now. Try scheduling easier tasks for this time when possible.',
        action: 'Optimize Schedule'
      },
      {
        title: 'Energy Management Tip',
        message: 'Your focus drops after lunch. A protein snack at 2:30 PM might help maintain your energy.',
        action: 'Nutrition Tips'
      }
    ]
  },

  {
    id: 'friday-exhaustion',
    category: 'time-patterns',
    tone: 'supportive',
    context: 'User is consistently exhausted by Friday',
    variations: [
      {
        title: 'Weekend Restoration',
        message: 'You often end the week exhausted. Schedule a longer reset session this weekend to fully recharge.',
        action: 'Plan Weekend Reset'
      },
      {
        title: 'Friday Fatigue Pattern',
        message: 'By Friday, you\'re running on empty. Consider lighter Thursday evenings to preserve energy.',
        action: 'Adjust Week Flow'
      },
      {
        title: 'Week\'s End Care',
        message: 'Your energy depletes through the week. Small Wednesday resets could help you finish stronger.',
        action: 'Midweek Reset Plan'
      }
    ]
  },

  // Reset & Recovery Patterns
  {
    id: 'missed-reset-consequence',
    category: 'reset-patterns',
    tone: 'gentle',
    context: 'User\'s stress increases after skipping resets',
    variations: [
      {
        title: 'Reset Reminder',
        message: 'Skipping resets seems to increase your stress levels. Even a 2-minute micro-reset can help maintain balance.',
        action: 'Quick Reset Now'
      },
      {
        title: 'Pattern Alert',
        message: 'When you skip resets, stress builds up faster. Your future self will thank you for taking 5 minutes now.',
        action: 'Start Timer'
      },
      {
        title: 'Gentle Nudge',
        message: 'No judgment - life gets busy! But your data shows consistent resets reduce your stress by 60%.',
        action: 'Schedule Resets'
      }
    ]
  },

  {
    id: 'reset-effectiveness',
    category: 'reset-patterns',
    tone: 'encouraging',
    context: 'Certain reset types work better for user',
    variations: [
      {
        title: 'Your Perfect Reset',
        message: 'Breathwork resets work best for you - 4.5/5 effectiveness rating! Make this your go-to tool.',
        action: 'Favorite This Reset'
      },
      {
        title: 'Data Insight',
        message: 'Movement resets give you the biggest mood boost. Consider these when feeling stuck.',
        action: 'Browse Movement'
      }
    ]
  },

  // Positive Reinforcement
  {
    id: 'streak-achievement',
    category: 'achievements',
    tone: 'celebratory',
    context: 'User maintains consistent wellness streak',
    variations: [
      {
        title: '7 Day Streak! 🎉',
        message: 'Your consistency is paying off. You\'re building sustainable wellness habits that will serve you well.',
        action: undefined
      },
      {
        title: '14 Days Strong! 💪',
        message: 'Two weeks of prioritizing yourself! This commitment to wellness is transforming your stress resilience.',
        action: undefined
      },
      {
        title: '30 Day Milestone! 🏆',
        message: 'A full month of wellness! You\'ve proven this is not just a phase - it\'s your new baseline.',
        action: undefined
      }
    ]
  },

  {
    id: 'improvement-noticed',
    category: 'achievements',
    tone: 'encouraging',
    context: 'User\'s stress/mood patterns are improving',
    variations: [
      {
        title: 'Progress Detected',
        message: 'Your stress levels are 30% lower than last month. Whatever you\'re doing is working!',
        action: 'View Progress'
      },
      {
        title: 'Positive Trend',
        message: 'You\'re bouncing back from difficult assignments faster. Your resilience is growing.',
        action: 'See Timeline'
      },
      {
        title: 'Growth Noticed',
        message: 'You\'re choosing "energized" and "focused" 40% more often. Your wellness practice is paying off.',
        action: 'Emotion History'
      }
    ]
  },

  // Wellness Recommendations
  {
    id: 'personalized-suggestion',
    category: 'recommendations',
    tone: 'supportive',
    context: 'Proactive wellness suggestions based on patterns',
    variations: [
      {
        title: 'Tailored for You',
        message: 'Based on your patterns, morning breathwork and afternoon walks would address 80% of your stress points.',
        action: 'Create Routine'
      },
      {
        title: 'Your Wellness Recipe',
        message: 'Your data reveals a winning combo: boundaries after medical, breathwork for anxiety, movement for energy.',
        action: 'Save Formula'
      },
      {
        title: 'Custom Insight',
        message: 'You respond best to prevention. Setting intentions before challenging days reduces your stress significantly.',
        action: 'Morning Intentions'
      }
    ]
  },

  // Gentle Warnings
  {
    id: 'burnout-risk',
    category: 'warnings',
    tone: 'gentle',
    context: 'User showing signs of potential burnout',
    variations: [
      {
        title: 'Check-In Time',
        message: 'You\'ve logged "exhausted" 5 times this week. Consider scheduling a longer restoration session soon.',
        action: 'Book Self-Care'
      },
      {
        title: 'Wellness Alert',
        message: 'Your stress has been high for 10+ days. This is your sign to prioritize recovery.',
        action: 'Recovery Plan'
      },
      {
        title: 'Care Reminder',
        message: 'You\'re giving so much to others. Remember: you can\'t pour from an empty cup.',
        action: 'Fill Your Cup'
      }
    ]
  },

  // Seasonal/Contextual
  {
    id: 'seasonal-adjustment',
    category: 'seasonal',
    tone: 'supportive',
    context: 'Patterns related to seasons or holidays',
    variations: [
      {
        title: 'Winter Wellness',
        message: 'Darker days affecting your mood? Your afternoon energy dips are stronger in winter. Try light therapy.',
        action: 'Winter Tips'
      },
      {
        title: 'Holiday Stress',
        message: 'December assignments plus holiday stress is a tough combo. Double down on boundaries this month.',
        action: 'Holiday Boundaries'
      }
    ]
  }
];

/**
 * Tone Guidelines for UX Microcopy
 */
export const TONE_GUIDELINES = {
  supportive: {
    description: 'Understanding and non-judgmental',
    characteristics: ['Validates feelings', 'Offers gentle suggestions', 'Uses "tend to" and "often"'],
    avoid: ['Commanding language', 'Absolutes', 'Judgment words'],
    examples: ['You often feel...', 'This might help...', 'Consider trying...']
  },
  
  encouraging: {
    description: 'Positive and motivating without toxic positivity',
    characteristics: ['Celebrates progress', 'Focuses on growth', 'Acknowledges effort'],
    avoid: ['Dismissing struggles', 'Over-enthusiasm', 'Comparison to others'],
    examples: ['You\'re making progress', 'This is working for you', 'Keep going']
  },
  
  gentle: {
    description: 'Soft and caring approach for sensitive topics',
    characteristics: ['Extra compassion', 'Permissive language', 'Emphasizes choice'],
    avoid: ['Pressure', 'Urgency unless critical', 'Should/must language'],
    examples: ['When you\'re ready...', 'No judgment...', 'It\'s okay to...']
  },
  
  motivating: {
    description: 'Action-oriented and empowering',
    characteristics: ['Solution-focused', 'Emphasizes capability', 'Clear next steps'],
    avoid: ['Overwhelming options', 'Complex instructions', 'Passive voice'],
    examples: ['You can...', 'Let\'s tackle...', 'One step at a time']
  },
  
  celebratory: {
    description: 'Recognizing achievements and milestones',
    characteristics: ['Genuine praise', 'Specific accomplishments', 'Future-oriented'],
    avoid: ['Generic praise', 'Minimizing achievement', 'Immediate new goals'],
    examples: ['You did it!', 'This milestone shows...', 'You\'ve proven...']
  }
};

/**
 * Dynamic Copy Generation Rules
 */
export const COPY_GENERATION_RULES = {
  // Use person's name if available
  personalization: {
    useFirstName: true,
    fallback: 'You',
    example: 'Sarah, you often feel drained...' vs 'You often feel drained...'
  },
  
  // Time-sensitive language
  timeSensitive: {
    morning: ['Start your day...', 'This morning...', 'Before your first assignment...'],
    afternoon: ['This afternoon...', 'Post-lunch...', 'Midday reset...'],
    evening: ['Wind down...', 'Before bed...', 'Evening restoration...'],
    weekend: ['This weekend...', 'Take advantage of the slower pace...', 'Weekend is perfect for...']
  },
  
  // Urgency levels
  urgency: {
    low: ['When you have time...', 'Consider...', 'You might want to...'],
    medium: ['Soon would be good...', 'In the next day or two...', 'Don\'t wait too long...'],
    high: ['Right now...', 'This needs attention...', 'Priority alert...']
  },
  
  // Cultural sensitivity
  culturalNotes: {
    avoidAssumptions: true,
    includeDiversePractices: true,
    respectfulLanguage: true,
    examples: ['meditation/quiet reflection', 'movement/gentle activity', 'rest/restoration']
  }
};

/**
 * Helper function to get contextual nudge copy
 */
export function getContextualNudge(
  patternId: string,
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  urgencyLevel: 'low' | 'medium' | 'high',
  userName?: string
): { title: string; message: string; action?: string } {
  const nudgeVariations = NUDGE_COPY_LIBRARY.find(n => n.id === patternId);
  if (!nudgeVariations) return { title: 'Wellness Insight', message: 'We noticed a pattern in your data.' };
  
  // Select random variation to prevent repetition
  const variation = nudgeVariations.variations[
    Math.floor(Math.random() * nudgeVariations.variations.length)
  ];
  
  // Personalize if name provided
  let message = variation.message;
  if (userName) {
    message = message.replace('You ', `${userName}, you `);
  }
  
  // Adjust for time of day
  if (timeOfDay === 'morning' && message.includes('Try')) {
    message = message.replace('Try', 'Start your day with');
  } else if (timeOfDay === 'evening' && message.includes('Try')) {
    message = message.replace('Try', 'End your day with');
  }
  
  return {
    title: variation.title,
    message,
    action: variation.action
  };
}