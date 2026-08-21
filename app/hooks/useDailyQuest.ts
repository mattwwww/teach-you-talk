import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDailyQuest() {
  useEffect(() => {
    scheduleDailyReminderOnce();
  }, []);
}

async function scheduleDailyReminderOnce() {
  const lastScheduled = await AsyncStorage.getItem('notifScheduledDate');
  const today = new Date().toDateString();
  if (lastScheduled === today) return; // already scheduled today, skip

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '今日任務等緊你！ ⚔️',
      body: '完成一個情境挑戰，賺取口杯，升級你嘅角色！',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });

  await AsyncStorage.setItem('notifScheduledDate', today);
}
