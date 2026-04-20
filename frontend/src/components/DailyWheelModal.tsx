import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRIZES = [
  { type: 'coins', amount: 25, label: '25', color: '#4CAF50', icon: 'cash' },
  { type: 'medals', amount: 1, label: '1', color: '#FF9800', icon: 'medal' },
  { type: 'coins', amount: 50, label: '50', color: '#4CAF50', icon: 'cash' },
  { type: 'medals', amount: 3, label: '3', color: '#FF9800', icon: 'medal' },
  { type: 'coins', amount: 100, label: '100', color: '#2196F3', icon: 'cash' },
  { type: 'medals', amount: 5, label: '5', color: '#E91E63', icon: 'medal' },
  { type: 'coins', amount: 200, label: '200', color: '#9C27B0', icon: 'cash' },
  { type: 'free_pack', amount: 1, label: 'FREE', color: '#FFD700', icon: 'gift' },
];

const SLICE_ANGLE = 360 / PRIZES.length;

interface DailyWheelModalProps {
  visible: boolean;
  onClose: () => void;
  onSpin: () => Promise<any>;
  streak: number;
}

export const DailyWheelModal: React.FC<DailyWheelModalProps> = ({ visible, onClose, onSpin, streak }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    try {
      const data = await onSpin();
      const prize = data.prize;

      // Find the prize index on the wheel
      const prizeIndex = PRIZES.findIndex(
        p => p.type === prize.type && p.amount === prize.amount
      );
      const targetIndex = prizeIndex >= 0 ? prizeIndex : 0;

      // Calculate rotation: multiple full rotations + land on the prize
      const targetAngle = 360 - (targetIndex * SLICE_ANGLE + SLICE_ANGLE / 2);
      const totalRotation = 360 * 5 + targetAngle; // 5 full spins + target

      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: totalRotation,
        duration: 4000,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        setResult(data);
        setSpinning(false);
      });
    } catch (err: any) {
      setSpinning(false);
      setResult({ error: err.message || 'Failed to spin' });
    }
  };

  const handleClose = () => {
    spinAnim.setValue(0);
    setResult(null);
    setSpinning(false);
    onClose();
  };

  const wheelRotation = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 300);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} data-testid="close-wheel-btn">
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Daily Spin</Text>
          {streak > 0 && (
            <Text style={styles.streak}>
              {streak} day streak! {streak >= 7 ? 'BIG PRIZE guaranteed!' : `${7 - streak} more for bonus!`}
            </Text>
          )}

          {/* Wheel */}
          <View style={[styles.wheelContainer, { width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20 }]}>
            {/* Pointer */}
            <View style={styles.pointer}>
              <Ionicons name="caret-down" size={32} color="#FFD700" />
            </View>

            <Animated.View
              style={[
                styles.wheel,
                { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2 },
                { transform: [{ rotate: wheelRotation }] },
              ]}
            >
              {PRIZES.map((prize, index) => {
                const rotation = index * SLICE_ANGLE;
                return (
                  <View
                    key={index}
                    style={[
                      styles.slice,
                      {
                        transform: [
                          { rotate: `${rotation}deg` },
                          { translateY: -WHEEL_SIZE / 4 },
                        ],
                      },
                    ]}
                  >
                    <View style={[styles.sliceContent, { backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }]}>
                      <Ionicons
                        name={prize.icon as any}
                        size={18}
                        color={prize.color}
                      />
                      <Text style={[styles.sliceText, { color: prize.color }]}>{prize.label}</Text>
                    </View>
                  </View>
                );
              })}
              <View style={styles.wheelCenter}>
                <Text style={styles.wheelCenterText}>SPIN</Text>
              </View>
            </Animated.View>
          </View>

          {/* Result */}
          {result && !result.error && (
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>You won!</Text>
              <Text style={styles.resultPrize}>{result.prize.label}</Text>
              <Text style={styles.resultType}>
                {result.prize.type === 'coins' ? 'Coins' : result.prize.type === 'medals' ? 'Medals' : 'Free Pack'}
              </Text>
              {result.streak_bonus && <Text style={styles.streakBonus}>7-Day Streak Bonus!</Text>}
            </View>
          )}

          {/* Spin Button */}
          {!result ? (
            <TouchableOpacity
              style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
              onPress={handleSpin}
              disabled={spinning}
              data-testid="spin-wheel-btn"
            >
              <Text style={styles.spinButtonText}>{spinning ? 'SPINNING...' : 'SPIN!'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.collectButton} onPress={handleClose} data-testid="collect-prize-btn">
              <Text style={styles.collectButtonText}>COLLECT</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxWidth: 360, backgroundColor: '#1a1a2e', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#FFD700' },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 6 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  streak: { fontSize: 13, color: '#CE93D8', marginBottom: 12, textAlign: 'center' },
  wheelContainer: { justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
  pointer: { position: 'absolute', top: -4, zIndex: 10 },
  wheel: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a', borderWidth: 4, borderColor: '#FFD700' },
  slice: { position: 'absolute', alignItems: 'center', width: 60, height: 60 },
  sliceContent: { alignItems: 'center', padding: 6, borderRadius: 8, minWidth: 50 },
  sliceText: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  wheelCenter: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  wheelCenterText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  resultSection: { alignItems: 'center', marginVertical: 12 },
  resultTitle: { fontSize: 16, color: '#aaa', marginBottom: 4 },
  resultPrize: { fontSize: 36, fontWeight: 'bold', color: '#FFD700' },
  resultType: { fontSize: 14, color: '#888', marginTop: 2 },
  streakBonus: { fontSize: 14, fontWeight: 'bold', color: '#E91E63', marginTop: 8 },
  spinButton: { backgroundColor: '#FFD700', paddingHorizontal: 48, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
  spinButtonDisabled: { backgroundColor: '#555' },
  spinButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  collectButton: { backgroundColor: '#4CAF50', paddingHorizontal: 48, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
  collectButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
