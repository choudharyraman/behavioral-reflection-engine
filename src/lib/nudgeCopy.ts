// Catchy nudge copy lines organized by deviation type and tone
// Non-judgmental, speculative language following behavioral reflection principles

export interface NudgeCopy {
  title: string;
  narrative: string;
  emoji?: string;
}

export const nudgeTitles: Record<string, string[]> = {
  food: [
    "Hungry for more? 🍕",
    "Foodie week detected! 🍜",
    "Your taste buds have been busy",
    "Something cooking with your food spend",
    "Cravings hitting different this week?"
  ],
  transport: [
    "On the move lately! 🚗",
    "Traveling more than usual",
    "Your wheels have been spinning",
    "Journey spending looks different",
    "Going places this week?"
  ],
  shopping: [
    "Shopping spree vibes? 🛍️",
    "Retail therapy detected",
    "Cart looking heavier than usual",
    "Your wishlist came true",
    "The deals were too good?"
  ],
  entertainment: [
    "Living your best life! 🎬",
    "Fun meter is up!",
    "Entertainment mode: activated",
    "Treating yourself lately?",
    "The good times are rolling"
  ],
  bills: [
    "Bills caught up with you",
    "Utilities looking different",
    "A heavier month for bills",
    "Some extra expenses this period"
  ],
  health: [
    "Investing in yourself 💪",
    "Health spending is up",
    "Taking care of you",
    "Wellness on your mind?"
  ],
  default: [
    "Noticed something different",
    "A pattern caught our eye",
    "Something looks unusual",
    "Your spending shifted a bit"
  ]
};

export const nudgeNarratives: Record<string, string[]> = {
  high_deviation: [
    "It looks like you've been spending more than usual on {category}. This could be a one-time thing or a shift in routine—only you know!",
    "We noticed a notable change in your {category} spending this week. Just flagging it so you're aware.",
    "Your {category} spending seems higher than your typical pattern. Thought you'd want to know!",
    "Heads up—{category} is trending above your usual baseline. No judgment, just keeping you in the loop."
  ],
  moderate_deviation: [
    "Your {category} spending is a bit above the usual. Nothing major, just a gentle heads up.",
    "We spotted a small uptick in {category}. Might be worth a quick glance.",
    "There's been a slight change in your {category} pattern. Just keeping you informed!"
  ],
  positive_change: [
    "Nice work! Your {category} spending is looking healthier than usual. 🎉",
    "You've been more mindful with {category} lately. Keep it up!",
    "Your {category} spending is down—intentional or happy accident?"
  ]
};

export const quickResponseLabels = [
  { id: 'oneoff', label: 'One-time thing', emoji: '✨' },
  { id: 'planned', label: 'I planned this', emoji: '📋' },
  { id: 'routine', label: 'Change in routine', emoji: '🔄' },
  { id: 'aware', label: 'Already aware', emoji: '👍' },
  { id: 'later', label: 'Will check later', emoji: '⏰' },
  { id: 'surprise', label: "Didn't realize!", emoji: '😮' }
];

export function getRandomNudgeCopy(category: string, deviationType: 'high_deviation' | 'moderate_deviation' | 'positive_change' = 'high_deviation'): NudgeCopy {
  const titles = nudgeTitles[category.toLowerCase()] || nudgeTitles.default;
  const narratives = nudgeNarratives[deviationType];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  const narrativeTemplate = narratives[Math.floor(Math.random() * narratives.length)];
  const narrative = narrativeTemplate.replace('{category}', category.toLowerCase());
  
  return { title, narrative };
}

export function formatNudgeNotification(category: string, deviationPercentage: number, currentAmount: number): { title: string; body: string } {
  const isHighDeviation = deviationPercentage >= 50;
  const deviationType = isHighDeviation ? 'high_deviation' : 'moderate_deviation';
  const copy = getRandomNudgeCopy(category, deviationType);
  
  return {
    title: copy.title,
    body: `${copy.narrative} (+${deviationPercentage}% this week, ₹${currentAmount.toLocaleString()})`
  };
}
