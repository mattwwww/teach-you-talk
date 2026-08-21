import type { Practice } from './data';

export type WordingChange = {
  from: string;
  to: string;
  reason: string;
};

export type ElaborationIdea = {
  id: string;
  label: string;
  fragment: string;
  explanation: string;
};

export type LanguageAnalysis = {
  summary: string;
  strengths: string[];
  wordingChanges: WordingChange[];
  elaborations: ElaborationIdea[];
  upgradedExample: string;
};

const vagueWording = [
  { pattern: /^(ok|okay|好|得)(呀|啊|啦|喇)?[。！？]?$/i, from: 'OK／好', to: '好呀，唔該你', reason: '加返對象同禮貌語，聽落會完整好多。' },
  { pattern: /^(係|嗯|哦|喔)(呀|啊|啦|喇|囉)?[。！？]?$/i, from: '係／嗯／哦', to: '係呀，我覺得…', reason: '由確認對方，行多一步講自己嘅想法。' },
  { pattern: /唔知/, from: '唔知', to: '我唔太肯定，不過…', reason: '保留誠實，同時畀對話有位繼續。' },
  { pattern: /冇所謂/, from: '冇所謂', to: '我兩樣都可以，如果要揀我會…', reason: '講出少少偏好，對方會更容易接住。' },
  { pattern: /是但/, from: '是但', to: '我都可以，我比較想…', reason: '用一個溫和選擇代替太含糊嘅回應。' },
];

const detailsByPractice: Record<string, { feeling: string; reason: string; detail: string; closing: string }> = {
  'cafe-order': { feeling: '我想飲清爽啲', reason: '因為今日有少少熱', detail: '少甜同少冰就得', closing: '麻煩你，唔該晒' },
  lift: { feeling: '我今日有少少趕時間', reason: '因為就嚟遲到', detail: '我去十二樓', closing: '唔該幫我撳一撳' },
  shop: { feeling: '我想環保啲', reason: '因為我自己帶咗袋', detail: '唔使膠袋喇', closing: '唔該晒' },
  direction: { feeling: '我記得應該唔遠', reason: '因為我頭先經過嗰邊', detail: '直行到路口再轉左', closing: '希望幫到你' },
  colleague: { feeling: '我覺得嗰間幾方便', reason: '因為出餐快又唔太貴', detail: '喺樓下轉右就到', closing: '你想嘅話可以一齊去' },
};

function clean(text: string) {
  return text.trim().replace(/[，。！？、,.!?]+$/g, '');
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function appendFragment(text: string, fragment: string) {
  const base = clean(text);
  if (!base) return fragment;
  if (base.includes(fragment)) return base;
  return `${base}，${fragment}`;
}

export function analyseCantoneseResponse(text: string, practice: Practice): LanguageAnalysis {
  const response = clean(text);
  const details = detailsByPractice[practice.id] ?? detailsByPractice['cafe-order']!;
  const characterCount = response.replace(/\s/g, '').length;
  const hasFeeling = includesAny(response, ['覺得', '感覺', '想', '鍾意', '開心', '緊張', '擔心', '方便', '好味']);
  const hasReason = includesAny(response, ['因為', '所以', '由於']);
  const hasDetail = characterCount >= 13 || includesAny(response, ['今日', '聽日', '頭先', '而家', '樓', '分鐘', '少甜', '少冰', '路口', '轉左', '轉右']);
  const hasPoliteEnding = includesAny(response, ['唔該', '麻煩', '多謝', '希望幫到你']);

  const strengths: string[] = [];
  if (characterCount >= practice.target) strengths.push('你已經唔止一兩個字，句子有完整意思。');
  if (hasFeeling) strengths.push('你有講自己嘅想法／感受，對方更容易了解你。');
  if (hasReason) strengths.push('你有補充原因，內容聽落更具體。');
  if (hasDetail) strengths.push('你有加入實際細節，對話更自然。');
  if (hasPoliteEnding) strengths.push('你有禮貌收尾，語氣幾舒服。');

  const wordingChanges = vagueWording
    .filter((item) => item.pattern.test(response))
    .map(({ from, to, reason }) => ({ from, to, reason }));

  const elaborations: ElaborationIdea[] = [];
  if (!hasFeeling) elaborations.push({ id: 'feeling', label: '加感受／想法', fragment: details.feeling, explanation: '講少少自己點睇，唔再只係答「係」或「好」。' });
  if (!hasReason) elaborations.push({ id: 'reason', label: '加一個原因', fragment: details.reason, explanation: '用「因為」補一句，對方就有更多內容可以接。' });
  if (!hasDetail) elaborations.push({ id: 'detail', label: '加實際細節', fragment: details.detail, explanation: '時間、地點、數量或做法，都可以令句子更清楚。' });
  if (!hasPoliteEnding) elaborations.push({ id: 'closing', label: '加自然收尾', fragment: details.closing, explanation: '一句簡單收尾會令語氣完整又友善。' });

  let upgradedExample = response;
  if (!upgradedExample || characterCount <= 4) upgradedExample = practice.example;
  else {
    const firstIdea = elaborations.find((idea) => idea.id === 'reason') ?? elaborations[0];
    if (firstIdea) upgradedExample = appendFragment(upgradedExample, firstIdea.fragment);
  }

  const summary = characterCount <= 4
    ? '而家個回應比較短；加一個想法同一個細節，就會由「應一聲」變成真正對話。'
    : elaborations.length >= 3
      ? '意思已經聽得明，再加原因或細節，對方會更容易接住講。'
      : elaborations.length
        ? '句子已經幾完整，只差一小段補充就更自然。'
        : '內容完整：有想法、有原因，亦有足夠細節。';

  return { summary, strengths, wordingChanges, elaborations, upgradedExample };
}
