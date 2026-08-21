import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';

function Icon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{symbol}</Text>;
}

const tabBar = {
  backgroundColor: colors.paper,
  borderTopColor: colors.line,
  height: 74,
  paddingTop: 8,
  paddingBottom: 9,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabBar,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '今日', tabBarIcon: ({ focused }) => <Icon symbol="☀️" focused={focused} /> }} />
      <Tabs.Screen name="feed" options={{ title: '快練', tabBarIcon: ({ focused }) => <Icon symbol="⚡" focused={focused} /> }} />
      <Tabs.Screen name="arena" options={{ title: '練句', tabBarIcon: ({ focused }) => <Icon symbol="🎙️" focused={focused} /> }} />
      <Tabs.Screen name="street" options={{ title: '出街', tabBarIcon: ({ focused }) => <Icon symbol="👋" focused={focused} /> }} />
      <Tabs.Screen name="stats" options={{ title: '旅程', tabBarIcon: ({ focused }) => <Icon symbol="🌱" focused={focused} /> }} />
      <Tabs.Screen name="boss" options={{ href: null }} />
    </Tabs>
  );
}
