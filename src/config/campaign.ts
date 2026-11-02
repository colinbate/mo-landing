/**
 * Everything that changes from one Movember to the next lives here.
 * Update this file and replace the photos in `src/assets/mo/` each year.
 */
export const campaign = {
  year: 2026,
  name: 'Colin Bate',
  firstName: 'Colin',
  location: 'Bermuda',

  /** Movember member id, used by the API adapter. */
  memberId: 14366159,

  /** Used if the Movember API is unreachable. */
  fallbackGoal: 1200,
  currency: 'CAD',
  locale: 'en-CA',

  donateUrl: 'https://ca.movember.com/donate/details?memberId=14366159',
  profileUrl: 'https://movember.com/m/colin-bate',
  movemberUrl: 'https://ca.movember.com/',
  eventsUrl: 'https://movember.divora.world/2026',

  /** Daily photos are named `day-01.jpg`, `day-02.jpg`, … Day 1 is this date. */
  photoStart: { month: 11, day: 1 },
  campaignDays: 30,

  headline: 'Growing a moustache for men’s health.',
  intro:
    'Every November I grow a moustache and run tabletop games to raise money for Movember. Follow along, watch it fill in, and give what you can.',
  movemberBlurb:
    'Movember funds research and support programs for prostate cancer, testicular cancer, mental health and suicide prevention.',

  story: [
    'In 2020 my father was diagnosed with prostate cancer. He was treated, and he beat it. Not everyone does.',
    'As a man with three brothers and two sons, men’s health is not an abstract cause for me. So each November I grow a moustache, run a few games for friends and strangers, and ask people to give what they can.',
    'This is my seventh Movember. Every dollar goes directly to Movember through their official platform.',
  ],

  events: {
    title: 'Enterprising Warlocks',
    summary:
      'The town of Edenvale sits beside the Slime Lands, a bog that stinks for most of the year. A garish airship has appeared over the border, skeletons are climbing down from it, and the monuments that keep the swamp contained are being smashed. The town wants outside help, and nobody local is keen to go out in the heat.',
    details: [
      { label: 'System', value: 'Keeper’s Call, a rules-light fantasy RPG' },
      { label: 'Where', value: 'Online and in person' },
      { label: 'Table size', value: '3 to 4 players' },
      { label: 'Experience', value: 'Any level. Beginners welcome.' },
      { label: 'Cost', value: 'A donation to my Movember campaign, any amount' },
    ],
    note: 'Every session runs the same adventure, so you only need to join one. Characters are made at the table in a few minutes and there is no preparation necessary.',
  },
} as const;
