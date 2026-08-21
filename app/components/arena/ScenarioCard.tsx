import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LOCATION_EMOJI: Record<string, string> = {
  '便利店': '🏪',
  '公園': '🌳',
  '升降機': '🛗',
  '地鐵站': '🚇',
  '學校/大學': '🏫',
  '課室': '📝',
  '工作場所': '💼',
  '巴士上': '🚌',
  '巴士站': '🚏',
  '旅遊巴': '🚌',
  '急症室': '🚑',
  '機場': '✈️',
  '書店': '📚',
  '朋友聚會': '🎉',
  '茶餐廳': '🍵',
  '街市': '🥬',
  '診所': '🩺',
  '超市': '🛒',
  '超市收銀處': '🛒',
  '酒店': '🏨',
  '醫院': '🏥',
  '醫院藥房': '💊',
  '銀行': '🏦',
  '電話': '📱',
  '餐廳': '🍽️',
  '郵局': '📮',
  '健身房': '🏋️',
  '髮型屋': '💈',
  '美容院': '💅',
  '咖啡店': '☕',
  '的士': '🚕',
  '速食店': '🍔',
  '圖書館': '📖',
  '購物商場': '🛍️',
  '洗衣店': '👕',
  '眼鏡店': '👓',
  '藥房': '💊',
  '物業管理處': '🏢',
  '補習社': '📐',
  '體育館': '🏸',
  '警察局': '🚔',
  '熟食中心': '🍜',
  '社區中心': '🏛️',
  '找換店': '💱',
  '珍珠奶茶店': '🧋',
  '大廈大堂': '🏗️',
  '面試': '👔',
  '地產代理': '🏠',
  '鄰居': '🚪',
  '入境事務處': '🛂',
  '稅務局': '📋',
  '社會福利署': '🤝',
  '勞工處': '⚖️',
  '家長會': '👨‍👩‍👧',
  '婚宴酒樓': '💒',
  '牙醫診所': '🦷',
  '客服熱線': '☎️',
  '游泳池': '🏊',
  '幼稚園': '🧒',
  '搬屋': '📦',
  '飲茶酒樓': '🍡',
  '過年拜年': '🧧',
  '維修工人': '🔧',
  '電影院': '🎬',
  '探病': '💐',
  '海關入境': '🛃',
  '戶外燒烤': '🔥',
  '旅行社': '✈️',
  '賣旗籌款': '🚩',
  '演唱會': '🎤',
  '獸醫診所': '🐾',
  '駕駛學校': '🚗',
  '辦公室新人': '🪪',
  '法律諮詢': '⚖️',
  '語言交換': '🗣️',
  '薪酬討論': '💰',
  '街上問路': '🗺️',
  '房屋署辦事處': '🏠',
  '停車場': '🅿️',
  '音樂課': '🎹',
  '急症室掛號': '🚑',
  '視像會議': '💻',
  '二手店': '♻️',
  '健康檢查中心': '🩻',
  '街市討價': '🐟',
  '義工中心': '🤲',
  '健身教練': '💪',
  '銀行開戶': '🏧',
  '修鞋修錶店': '🔩',
  '機場出境': '🛫',
  '招聘公司': '🤝',
  '大學入學面試': '🎓',
  '酒店退房': '🛎️',
  '烹飪班': '👨‍🍳',
  '大廈管委會': '🏛️',
  '寵物美容': '🐩',
  '補習老師': '📐',
  '按摩院': '💆',
  '電訊公司': '📶',
  '物理治療': '🦴',
  '花店': '💐',
  '網上購物客服': '📦',
  '眼科診所': '👁️',
  '水電維修': '🔧',
  '社區義診': '🩺',
  '圖書館借閱': '📗',
  '書法班': '🖌️',
  '相片沖印': '🖼️',
  '租車公司': '🚙',
  '快遞公司': '📫',
  '街坊小店': '🏬',
  '診所化驗室': '🔬',
  '廟宇教堂': '🛕',
  '殯儀館': '🕯️',
  '政府查詢熱線': '☎️',
  '珠寶店': '💍',
  '運動場地預約': '🏟️',
  '食物敏感溝通': '⚠️',
  '學校家長日': '🏫',
  '渡輪碼頭': '⛴️',
  '美食廣場': '🍱',
  '失物認領處': '🔍',
  '消費者委員會': '⚖️',
  '辦公室會議': '📊',
  '合租生活': '🏠',
  '誤會澄清': '🤝',
  '照顧者溝通': '👴',
  '街頭問卷調查': '📋',
  '網上交友初次見面': '💬',
  '公共交通意外': '🚨',
  '舊同學重聚': '🤙',
  '市場攤檔': '🏮',
  '報攤': '📰',
  '文具店': '✏️',
  '單車租借': '🚲',
  '屋苑設施': '🏊',
  '美甲店': '💅',
  '電腦維修店': '🖥️',
  '卡拉OK': '🎤',
  '棋盤遊戲店': '🎲',
  '裁縫改衫鋪': '🧵',
  '影樓': '📸',
  '乾洗店': '👔',
  '捐血站': '🩸',
};

interface Props {
  location: string;
  prompt: string;
  minWords?: number;
  completed?: boolean;
}

function getDifficulty(minWords: number): { label: string; color: string } {
  if (minWords <= 5) return { label: '🟢 初級', color: '#4ade80' };
  if (minWords <= 7) return { label: '🟡 中級', color: '#f0c040' };
  return { label: '🔴 高級', color: '#e94560' };
}

export function ScenarioCard({ location, prompt, minWords, completed }: Props) {
  const emoji = LOCATION_EMOJI[location] ?? '📍';
  const diff = minWords !== undefined ? getDifficulty(minWords) : null;
  return (
    <View style={[styles.card, completed && styles.cardDone]}>
      <View style={styles.topRow}>
        <Text style={styles.location}>{emoji} {location}</Text>
        <View style={styles.badgeGroup}>
          {completed && <Text style={styles.doneBadge}>✅ 已完成</Text>}
          {diff && (
            <Text style={[styles.diffBadge, { color: diff.color }]}>{diff.label}</Text>
          )}
        </View>
      </View>
      <Text style={styles.prompt}>{prompt}</Text>
      {minWords !== undefined && (
        <Text style={styles.target}>目標：{minWords}+ 字</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e94560',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardDone: { borderLeftColor: '#4ade80', opacity: 0.85 },
  badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneBadge: { color: '#4ade80', fontSize: 11, fontWeight: '700' },
  diffBadge: { fontSize: 11, fontWeight: '700' },
  target: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  prompt: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
  },
});
