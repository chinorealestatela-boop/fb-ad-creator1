import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useBillsStore } from '../store/billsStore';
import { useBudgetStore } from '../store/budgetStore';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  const loadBills = useBillsStore(s => s.load);
  const loadBudget = useBudgetStore(s => s.load);

  useEffect(() => {
    loadBills();
    loadBudget();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700', color: Colors.text },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="bill/add"
          options={{ title: 'Add Bill', presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="bill/[id]"
          options={{ title: 'Bill Details' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
