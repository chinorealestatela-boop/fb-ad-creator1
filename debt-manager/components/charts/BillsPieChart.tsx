import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { Bill } from '../../store/types';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIZE = Math.min(SCREEN_WIDTH - 64, 280);
const RADIUS = SIZE / 2;
const INNER_RADIUS = RADIUS * 0.55;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

interface Props {
  bills: Bill[];
  onSlicePress?: (bill: Bill) => void;
}

export function BillsPieChart({ bills, onSlicePress }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const activeBills = bills.filter(b => b.status !== 'paid' && b.amount > 0);
  const total = activeBills.reduce((s, b) => s + (b.balance ?? b.amount), 0);

  if (activeBills.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>No active bills</Text>
        <Text style={styles.emptySubtext}>Add a bill to see your breakdown</Text>
      </View>
    );
  }

  let currentAngle = 0;
  const slices = activeBills.map(bill => {
    const value = bill.balance ?? bill.amount;
    const pct = total > 0 ? value / total : 0;
    const sweep = pct * 360;
    const slice = {
      bill,
      startAngle: currentAngle,
      endAngle: currentAngle + sweep,
      pct,
    };
    currentAngle += sweep;
    return slice;
  });

  const cx = RADIUS;
  const cy = RADIUS;
  const selectedBill = activeBills.find(b => b.id === selected);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <G>
          {slices.map(({ bill, startAngle, endAngle, pct }) => {
            const isSelected = selected === bill.id;
            const scale = isSelected ? 1.05 : 1;
            const offsetR = isSelected ? RADIUS * 0.04 : 0;
            const midAngle = (startAngle + endAngle) / 2;
            const midRad = ((midAngle - 90) * Math.PI) / 180;
            const translateX = Math.cos(midRad) * offsetR;
            const translateY = Math.sin(midRad) * offsetR;

            return (
              <Path
                key={bill.id}
                d={describeArc(cx + translateX, cy + translateY, RADIUS * 0.92, startAngle, endAngle)}
                fill={bill.color}
                opacity={selected && !isSelected ? 0.4 : 1}
                onPress={() => {
                  const newSelected = selected === bill.id ? null : bill.id;
                  setSelected(newSelected);
                  if (newSelected && onSlicePress) onSlicePress(bill);
                }}
              />
            );
          })}
          <Circle cx={cx} cy={cy} r={INNER_RADIUS} fill={Colors.background} />
          {selectedBill ? (
            <>
              <SvgText
                x={cx} y={cy - 18}
                textAnchor="middle"
                fill={Colors.text}
                fontSize="13"
                fontWeight="600"
              >
                {selectedBill.name.length > 14
                  ? selectedBill.name.slice(0, 13) + '…'
                  : selectedBill.name}
              </SvgText>
              <SvgText
                x={cx} y={cy + 6}
                textAnchor="middle"
                fill={Colors.text}
                fontSize="18"
                fontWeight="700"
              >
                {formatCurrency(selectedBill.balance ?? selectedBill.amount)}
              </SvgText>
              <SvgText
                x={cx} y={cy + 26}
                textAnchor="middle"
                fill={Colors.textSecondary}
                fontSize="12"
              >
                {(slices.find(s => s.bill.id === selectedBill.id)?.pct || 0).toLocaleString('en', { style: 'percent', maximumFractionDigits: 1 })}
              </SvgText>
            </>
          ) : (
            <>
              <SvgText
                x={cx} y={cy - 10}
                textAnchor="middle"
                fill={Colors.textSecondary}
                fontSize="11"
              >
                TOTAL BILLS
              </SvgText>
              <SvgText
                x={cx} y={cy + 14}
                textAnchor="middle"
                fill={Colors.text}
                fontSize="20"
                fontWeight="700"
              >
                {formatCurrency(total)}
              </SvgText>
            </>
          )}
        </G>
      </Svg>

      <View style={styles.legend}>
        {activeBills.slice(0, 6).map(bill => (
          <TouchableOpacity
            key={bill.id}
            style={[styles.legendItem, selected === bill.id && styles.legendItemSelected]}
            onPress={() => {
              const newSelected = selected === bill.id ? null : bill.id;
              setSelected(newSelected);
              if (newSelected && onSlicePress) onSlicePress(bill);
            }}
          >
            <View style={[styles.legendDot, { backgroundColor: bill.color }]} />
            <Text style={styles.legendName} numberOfLines={1}>{bill.name}</Text>
            <Text style={styles.legendAmount}>{formatCurrency(bill.balance ?? bill.amount)}</Text>
          </TouchableOpacity>
        ))}
        {activeBills.length > 6 && (
          <Text style={styles.moreText}>+{activeBills.length - 6} more</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  empty: {
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  legend: {
    width: '100%',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  legendItemSelected: {
    backgroundColor: Colors.glass,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  legendAmount: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  moreText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
