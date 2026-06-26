import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BillStatus } from '../../store/types';
import { Colors, StatusColors } from '../../constants/colors';

const LABELS: Record<BillStatus, string> = {
  current: 'Current',
  'due-soon': 'Due Soon',
  'due-this-week': 'This Week',
  overdue: 'Overdue',
  paid: 'Paid',
};

interface StatusBadgeProps {
  status: BillStatus;
  small?: boolean;
}

export function StatusBadge({ status, small }: StatusBadgeProps) {
  const color = StatusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, small && styles.smallText]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});
