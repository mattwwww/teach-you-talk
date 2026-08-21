export type Practice = {
  id: string;
  place: string;
  emoji: string;
  stranger: string;
  prompt: string;
  starters: string[];
  target: number;
  example: string;
};

export const practices: Practice[] = [
  {
    id: 'cafe-order',
    place: '茶記',
    emoji: '🥤',
    stranger: '店員',
    prompt: '「凍檸茶要唔要少甜？」',
    starters: ['好呀，唔該', '我想要', '唔使喇，因為'],
    target: 6,
    example: '好呀，唔該幫我整少甜。',
  },
  {
    id: 'lift',
    place: '升降機',
    emoji: '🛗',
    stranger: '鄰居',
    prompt: '「你去幾樓呀？」',
    starters: ['我去', '唔該晒，我去', '我都係去'],
    target: 6,
    example: '我去十二樓，唔該幫我撳。',
  },
  {
    id: 'shop',
    place: '便利店',
    emoji: '🏪',
    stranger: '店員',
    prompt: '「要唔要膠袋？」',
    starters: ['唔使喇，我有', '要呀，麻煩', '唔該，我想要'],
    target: 7,
    example: '唔使喇，我自己有環保袋。',
  },
  {
    id: 'direction',
    place: '街上',
    emoji: '🗺️',
    stranger: '途人',
    prompt: '「唔好意思，地鐵站點行？」',
    starters: ['你可以', '我記得係', '唔好意思，我都'],
    target: 8,
    example: '你直行到路口，再轉左就見到。',
  },
  {
    id: 'colleague',
    place: '公司',
    emoji: '💼',
    stranger: '新同事',
    prompt: '「你平時晏晝去邊度食㗎？」',
    starters: ['我通常去', '附近有間', '今日不如'],
    target: 8,
    example: '我通常去樓下茶記，出餐幾快㗎。',
  },
];

export const quickPrompts = [
  { id: 'q1', emoji: '☕', scene: '咖啡店', line: '店員話：「今日好熱呀！」', ask: '用一句回應，講埋你嘅感受。', example: '係呀，熱到我都想飲凍嘢。' },
  { id: 'q2', emoji: '🐶', scene: '公園', line: '狗主問：「你係咪鍾意狗㗎？」', ask: '答佢，再加一個原因。', example: '係呀，我覺得狗狗好得意。' },
  { id: 'q3', emoji: '🌧️', scene: '巴士站', line: '途人話：「唔知幾時先停雨呢？」', ask: '回應佢，再講你下一步會點做。', example: '係囉，我諗住等多陣先走。' },
  { id: 'q4', emoji: '🍜', scene: '餐廳', line: '侍應問：「個湯味道得唔得？」', ask: '講感受，再講一個細節。', example: '幾好味呀，不過對我嚟講少少辣。' },
];

export type Mission = {
  id: string;
  phase: number;
  title: string;
  instruction: string;
  fallback: string;
  xp: number;
};

export const missions: Mission[] = [
  { id: 'm1', phase: 1, title: '望一望，點一點頭', instruction: '同一位店員有一秒眼神接觸，再點頭。', fallback: '如果太緊張，只望向對方眉心都得。', xp: 10 },
  { id: 'm2', phase: 1, title: '清楚講「唔該」', instruction: '完成付款後，用對方聽到嘅音量講「唔該」。', fallback: '可以先喺門外細聲試一次。', xp: 10 },
  { id: 'm3', phase: 2, title: '加多四個字', instruction: '買嘢時講：「唔該，我想要呢個。」', fallback: '照住手機讀都完全可以。', xp: 20 },
  { id: 'm4', phase: 2, title: '問一條實用問題', instruction: '向店員問價錢、方向或者營業時間。', fallback: '先寫低句子，去到直接讀出嚟。', xp: 20 },
  { id: 'm5', phase: 3, title: '一句感受＋原因', instruction: '同熟人講一句你今日嘅感受，再補一個原因。', fallback: '句式：「我今日有啲＿＿，因為＿＿。」', xp: 30 },
  { id: 'm6', phase: 3, title: '同陌生人來回兩句', instruction: '問一條問題，聽完答案後再講一句「原來係咁，唔該晒」。', fallback: '揀你最熟悉嘅店舖做就得。', xp: 40 },
];

export const levels = [
  { name: '開聲新手', at: 0, emoji: '🌱' },
  { name: '句子拍檔', at: 80, emoji: '🐣' },
  { name: '對話探險家', at: 200, emoji: '🦊' },
  { name: '街坊溝通員', at: 400, emoji: '🦁' },
];

export type RealReward = {
  id: string;
  xp: number;
  emoji: string;
  name: string;
  value: string;
  description: string;
  fulfilment: string;
};

export const realRewards: RealReward[] = [
  {
    id: 'coffee-20',
    xp: 80,
    emoji: '☕',
    name: '咖啡／飲品券',
    value: '價值 HK$20',
    description: '完成第一段旅程，請自己飲杯嘢，記住你真係踏出過第一步。',
    fulfilment: '達標後產生領獎碼，向「開口啦」活動負責人出示即可換領。',
  },
  {
    id: 'movie-50',
    xp: 200,
    emoji: '🎬',
    name: '電影現金券',
    value: '價值 HK$50',
    description: '獎勵你將練習由屋企帶到真實世界。',
    fulfilment: '達標後產生領獎碼，負責人核對後安排實體或電子券。',
  },
  {
    id: 'choice-100',
    xp: 400,
    emoji: '🎁',
    name: '自選生活禮券',
    value: '價值 HK$100',
    description: '完成整條成長路線，由你揀一份真正想要嘅獎勵。',
    fulfilment: '達標後聯絡活動負責人，以領獎碼登記你想要嘅禮券。',
  },
];
