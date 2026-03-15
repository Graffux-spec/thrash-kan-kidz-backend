import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import BuyCoinsModal from './components/BuyCoinsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 300);

interface SpinResult {
  won_card: any;
  rarity: string;
  is_duplicate: boolean;
  remaining_coins: number;
}

export default function ShopScreen() {
  const { user, allCards, userCards, apiUrl, refreshData } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [spinPool, setSpinPool] = useState<any[]>([]);
  const [spinConfig, setSpinConfig] = useState({ spin_cost: 50, odds: { common: 80, rare: 20 } });
  
  const spinAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const BACKGROUND_IMAGE = 'https://customer-assets.emergentagent.com/job_earn-cards/artifacts/zgy2com2_enhanced-1771247671181.jpg';

  useEffect(() => {
    fetchSpinData();
  }, [user]);

  const fetchSpinData = async () => {
    if (!user) return;
    try {
      const [configRes, poolRes] = await Promise.all([
        fetch(`${apiUrl}/api/spin/config`),
        fetch(`${apiUrl}/api/users/${user.id}/spin-pool`)
      ]);
      const config = await configRes.json();
      const pool = await poolRes.json();
      setSpinConfig(config);
      setSpinPool([...pool.common_cards, ...pool.rare_cards]);
    } catch (error) {
      console.error('Error fetching spin data:', error);
    }
  };

  const handleSpin = async () => {
    if (!user || spinning) return;
    
    if (user.coins < spinConfig.spin_cost) {
      setShowBuyCoins(true);
      return;
    }

    setSpinning(true);
    setSpinResult(null);
    
    // Reset animations
    spinAnim.setValue(0);
    cardScaleAnim.setValue(0);
    glowAnim.setValue(0);

    try {
      // Start spinning animation (multiple rotations)
      const spinDuration = 3000;
      const rotations = 5 + Math.random() * 3; // 5-8 rotations
      
      Animated.timing(spinAnim, {
        toValue: rotations,
        duration: spinDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Call API
      const response = await fetch(`${apiUrl}/api/users/${user.id}/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Wait for spin to finish then show result
        setTimeout(() => {
          setSpinResult(result);
          setShowResult(true);
          
          // Animate card reveal
          Animated.sequence([
            Animated.timing(cardScaleAnim, {
              toValue: 1.2,
              duration: 300,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(cardScaleAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Glow animation for rare cards
          if (result.rarity === 'rare') {
            Animated.loop(
              Animated.sequence([
                Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                  toValue: 0.5,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }
          
          setSpinning(false);
          refreshData();
        }, spinDuration);
      } else {
        setSpinning(false);
        alert(result.detail || 'Spin failed');
      }
    } catch (error) {
      console.error('Spin error:', error);
      setSpinning(false);
      alert('Failed to spin. Please try again.');
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setSpinResult(null);
    glowAnim.setValue(0);
  };

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: BACKGROUND_IMAGE }} style={styles.backgroundImage} resizeMode="cover" />
        <View style={styles.overlay} />
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Please login to visit the shop</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: BACKGROUND_IMAGE }} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.overlay} />

      {/* Buy Coins Modal */}
      <BuyCoinsModal visible={showBuyCoins} onClose={() => setShowBuyCoins(false)} />

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="fade" onRequestClose={closeResult}>
        <View style={styles.resultOverlay}>
          <View style={[
            styles.resultContainer,
            spinResult?.rarity === 'rare' && styles.resultContainerRare
          ]}>
            <Text style={styles.resultTitle}>
              {spinResult?.rarity === 'rare' ? '🌟 RARE CARD! 🌟' : '🎉 You Won!'}
            </Text>
            
            {spinResult && (
              <Animated.View style={[
                styles.resultCardContainer,
                { transform: [{ scale: cardScaleAnim }] }
              ]}>
                {spinResult.rarity === 'rare' && (
                  <Animated.View style={[
                    styles.rareGlow,
                    { opacity: glowAnim }
                  ]} />
                )}
                <Image
                  source={{ uri: spinResult.won_card.front_image_url }}
                  style={styles.resultCardImage}
                  resizeMode="contain"
                />
              </Animated.View>
            )}
            
            <Text style={styles.resultCardName}>{spinResult?.won_card?.name}</Text>
            <Text style={[
              styles.resultRarity,
              spinResult?.rarity === 'rare' && styles.resultRarityRare
            ]}>
              {spinResult?.rarity?.toUpperCase()}
            </Text>
            
            {spinResult?.is_duplicate && (
              <View style={styles.duplicateBadge}>
                <Text style={styles.duplicateText}>DUPLICATE - Added to collection for trading!</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.closeResultButton} onPress={closeResult}>
              <Text style={styles.closeResultText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Card Spinner</Text>
            <Text style={styles.subtitle}>Spin to win random cards!</Text>
          </View>
          <View style={styles.coinSection}>
            <View style={styles.coinDisplay}>
              <Text style={styles.coinIcon}>💰</Text>
              <Text style={styles.coinText}>{user.coins}</Text>
            </View>
            <TouchableOpacity 
              style={styles.buyCoinsButton}
              onPress={() => setShowBuyCoins(true)}
            >
              <Ionicons name="add-circle" size={16} color="#000" />
              <Text style={styles.buyCoinsText}>Buy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spin Wheel Section */}
        <View style={styles.wheelSection}>
          <View style={styles.wheelContainer}>
            {/* Wheel pointer */}
            <View style={styles.wheelPointer}>
              <Ionicons name="caret-down" size={40} color="#FFD700" />
            </View>
            
            {/* Spinning wheel */}
            <Animated.View style={[
              styles.wheel,
              { transform: [{ rotate: spinRotation }] }
            ]}>
              {/* Wheel segments with card previews */}
              {spinPool.slice(0, 8).map((card, index) => {
                const angle = (index * 45) - 90;
                return (
                  <View
                    key={card.id}
                    style={[
                      styles.wheelSegment,
                      {
                        transform: [
                          { rotate: `${angle}deg` },
                          { translateX: WHEEL_SIZE / 3 },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: card.front_image_url }}
                      style={styles.wheelCardImage}
                      resizeMode="cover"
                    />
                  </View>
                );
              })}
              
              {/* Center circle */}
              <View style={styles.wheelCenter}>
                <Text style={styles.wheelCenterText}>🎰</Text>
              </View>
            </Animated.View>
          </View>

          {/* Spin Button */}
          <TouchableOpacity
            style={[
              styles.spinButton,
              spinning && styles.spinButtonDisabled,
              user.coins < spinConfig.spin_cost && styles.spinButtonDisabled
            ]}
            onPress={handleSpin}
            disabled={spinning || user.coins < spinConfig.spin_cost}
          >
            {spinning ? (
              <Text style={styles.spinButtonText}>Spinning...</Text>
            ) : (
              <>
                <Text style={styles.spinButtonText}>SPIN!</Text>
                <Text style={styles.spinCostText}>{spinConfig.spin_cost} 💰</Text>
              </>
            )}
          </TouchableOpacity>

          {user.coins < spinConfig.spin_cost && (
            <Text style={styles.notEnoughCoins}>
              Not enough coins! Tap "Buy" to get more.
            </Text>
          )}
        </View>

        {/* Odds Info */}
        <View style={styles.oddsSection}>
          <Text style={styles.oddsSectionTitle}>Drop Rates</Text>
          <View style={styles.oddsContainer}>
            <View style={styles.oddsItem}>
              <View style={[styles.oddsIndicator, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.oddsText}>Common: {spinConfig.odds.common}%</Text>
            </View>
            <View style={styles.oddsItem}>
              <View style={[styles.oddsIndicator, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.oddsText}>Rare: {spinConfig.odds.rare}%</Text>
            </View>
          </View>
          <Text style={styles.oddsNote}>
            Rare cards appear after unlocking them through collection milestones!
          </Text>
        </View>

        {/* Cards in Pool */}
        <View style={styles.poolSection}>
          <Text style={styles.poolSectionTitle}>Cards in the Pool ({spinPool.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.poolScroll}>
            {spinPool.map((card) => (
              <View key={card.id} style={styles.poolCard}>
                <Image
                  source={{ uri: card.front_image_url }}
                  style={styles.poolCardImage}
                  resizeMode="cover"
                />
                <Text style={styles.poolCardName} numberOfLines={1}>{card.name}</Text>
                <Text style={[
                  styles.poolCardRarity,
                  card.rarity === 'rare' && styles.poolCardRarityRare
                ]}>
                  {card.rarity}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#888',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  coinSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  coinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  buyCoinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  buyCoinsText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Wheel Section
  wheelSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  wheelContainer: {
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  wheelPointer: {
    position: 'absolute',
    top: -5,
    zIndex: 10,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#1a1a2e',
    borderWidth: 4,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wheelSegment: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  wheelCardImage: {
    width: '100%',
    height: '100%',
  },
  wheelCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  wheelCenterText: {
    fontSize: 28,
  },
  spinButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 200,
  },
  spinButtonDisabled: {
    backgroundColor: '#555',
  },
  spinButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  spinCostText: {
    color: '#333',
    fontSize: 14,
    marginTop: 4,
  },
  notEnoughCoins: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  // Odds Section
  oddsSection: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  oddsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  oddsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oddsIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  oddsText: {
    color: '#ccc',
    fontSize: 14,
  },
  oddsNote: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Pool Section
  poolSection: {
    marginBottom: 24,
  },
  poolSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  poolScroll: {
    flexDirection: 'row',
  },
  poolCard: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  poolCardImage: {
    width: 70,
    height: 90,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  poolCardName: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  poolCardRarity: {
    color: '#4CAF50',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  poolCardRarityRare: {
    color: '#2196F3',
  },
  // Result Modal
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  resultContainerRare: {
    borderColor: '#2196F3',
    backgroundColor: '#1a2a3e',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  resultCardContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  rareGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    opacity: 0.3,
  },
  resultCardImage: {
    width: 150,
    height: 200,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  resultCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  resultRarity: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultRarityRare: {
    color: '#2196F3',
  },
  duplicateBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  duplicateText: {
    color: '#FF9800',
    fontSize: 12,
    textAlign: 'center',
  },
  closeResultButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  closeResultText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
