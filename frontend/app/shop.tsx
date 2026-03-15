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
import BuyCoinsModal from '../src/components/BuyCoinsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 280);

interface SpinResult {
  won_card: any;
  rarity: string;
  is_duplicate: boolean;
  remaining_coins: number;
  series_completion?: any;
}

interface SpinPoolData {
  current_series: number;
  series_name: string;
  series_description: string;
  series_cards: any[];
  owned_count: number;
  total_count: number;
  rare_reward: any;
  spin_cost: number;
}

export default function ShopScreen() {
  const { user, apiUrl, refreshData } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showSeriesComplete, setShowSeriesComplete] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [spinPool, setSpinPool] = useState<SpinPoolData | null>(null);
  const [spinConfig, setSpinConfig] = useState({ spin_cost: 50 });
  
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
      setSpinPool(pool);
    } catch (error) {
      console.error('Error fetching spin data:', error);
    }
  };

  const handleSpin = async () => {
    if (!user || spinning || !spinPool) return;
    
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
      // Start spinning animation
      const spinDuration = 3000;
      const rotations = 5 + Math.random() * 3;
      
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
          
          setSpinning(false);
          refreshData();
          fetchSpinData();
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
    // Check if series was completed
    if (spinResult?.series_completion?.series_completed) {
      setShowResult(false);
      setShowSeriesComplete(true);
    } else {
      setShowResult(false);
      setSpinResult(null);
    }
  };

  const closeSeriesComplete = () => {
    setShowSeriesComplete(false);
    setSpinResult(null);
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

  const progress = spinPool ? (spinPool.owned_count / spinPool.total_count) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: BACKGROUND_IMAGE }} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.overlay} />

      {/* Buy Coins Modal */}
      <BuyCoinsModal visible={showBuyCoins} onClose={() => setShowBuyCoins(false)} />

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="fade" onRequestClose={closeResult}>
        <View style={styles.resultOverlay}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>🎉 You Won!</Text>
            
            {spinResult && (
              <Animated.View style={[
                styles.resultCardContainer,
                { transform: [{ scale: cardScaleAnim }] }
              ]}>
                <Image
                  source={{ uri: spinResult.won_card.front_image_url }}
                  style={styles.resultCardImage}
                  resizeMode="contain"
                />
              </Animated.View>
            )}
            
            <Text style={styles.resultCardName}>{spinResult?.won_card?.name}</Text>
            <Text style={styles.resultBand}>
              {spinResult?.won_card?.band} - Card {spinResult?.won_card?.card_type}
            </Text>
            
            {spinResult?.is_duplicate && (
              <View style={styles.duplicateBadge}>
                <Text style={styles.duplicateText}>DUPLICATE - Added for trading!</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.closeResultButton} onPress={closeResult}>
              <Text style={styles.closeResultText}>
                {spinResult?.series_completion?.series_completed ? 'Continue...' : 'Awesome!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Series Complete Modal */}
      <Modal visible={showSeriesComplete} transparent animationType="fade" onRequestClose={closeSeriesComplete}>
        <View style={styles.resultOverlay}>
          <View style={[styles.resultContainer, styles.seriesCompleteContainer]}>
            <Text style={styles.seriesCompleteTitle}>🏆 SERIES COMPLETE! 🏆</Text>
            <Text style={styles.seriesCompleteName}>
              {spinResult?.series_completion?.series_name}
            </Text>
            
            {spinResult?.series_completion?.rare_reward && (
              <>
                <Text style={styles.rareRewardTitle}>Rare Card Unlocked!</Text>
                <Image
                  source={{ uri: spinResult.series_completion.rare_reward.front_image_url }}
                  style={styles.rareRewardImage}
                  resizeMode="contain"
                />
                <Text style={styles.rareRewardName}>
                  {spinResult.series_completion.rare_reward.name}
                </Text>
              </>
            )}
            
            {spinResult?.series_completion?.next_series_unlocked && (
              <Text style={styles.nextSeriesText}>
                Series {spinResult.series_completion.next_series_unlocked} Unlocked!
              </Text>
            )}
            
            <TouchableOpacity style={styles.closeResultButton} onPress={closeSeriesComplete}>
              <Text style={styles.closeResultText}>Amazing!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Card Spinner</Text>
            <Text style={styles.subtitle}>{spinPool?.series_name || 'Loading...'}</Text>
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

        {/* Series Progress */}
        {spinPool && (
          <View style={styles.seriesProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{spinPool.series_name}</Text>
              <Text style={styles.progressCount}>{spinPool.owned_count}/{spinPool.total_count}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            {spinPool.rare_reward && (
              <View style={styles.rewardPreview}>
                <Text style={styles.rewardLabel}>Complete to unlock:</Text>
                <Image 
                  source={{ uri: spinPool.rare_reward.front_image_url }}
                  style={styles.rewardThumb}
                  resizeMode="cover"
                />
                <Text style={styles.rewardName}>{spinPool.rare_reward.name}</Text>
              </View>
            )}
          </View>
        )}

        {/* Spin Wheel Section */}
        <View style={styles.wheelSection}>
          <View style={styles.wheelContainer}>
            <View style={styles.wheelPointer}>
              <Ionicons name="caret-down" size={40} color="#FFD700" />
            </View>
            
            <Animated.View style={[
              styles.wheel,
              { transform: [{ rotate: spinRotation }] }
            ]}>
              {spinPool?.series_cards.slice(0, 8).map((card, index) => {
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
                      card.owned && styles.wheelSegmentOwned
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
              
              <View style={styles.wheelCenter}>
                <Text style={styles.wheelCenterText}>🎰</Text>
              </View>
            </Animated.View>
          </View>

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

        {/* Cards Grid - Show all series cards */}
        {spinPool && (
          <View style={styles.cardsSection}>
            <Text style={styles.cardsSectionTitle}>
              {spinPool.series_name} Cards ({spinPool.owned_count}/{spinPool.total_count})
            </Text>
            <View style={styles.cardsGrid}>
              {spinPool.series_cards.map((card) => (
                <View 
                  key={card.id} 
                  style={[
                    styles.cardItem,
                    card.owned && styles.cardItemOwned
                  ]}
                >
                  <Image
                    source={{ uri: card.front_image_url }}
                    style={[
                      styles.cardImage,
                      !card.owned && styles.cardImageLocked
                    ]}
                    resizeMode="cover"
                    blurRadius={card.owned ? 0 : 10}
                  />
                  {!card.owned && (
                    <View style={styles.cardLockOverlay}>
                      <Ionicons name="help" size={24} color="#FFD700" />
                    </View>
                  )}
                  <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                  <Text style={styles.cardBand}>{card.band}-{card.card_type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  buyCoinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 2,
  },
  buyCoinsText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Series Progress
  seriesProgress: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  progressCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  rewardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  rewardLabel: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
  },
  rewardThumb: {
    width: 40,
    height: 50,
    borderRadius: 4,
    marginRight: 8,
  },
  rewardName: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  // Wheel Section
  wheelSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wheelContainer: {
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    width: 45,
    height: 55,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  wheelSegmentOwned: {
    borderColor: '#4CAF50',
  },
  wheelCardImage: {
    width: '100%',
    height: '100%',
  },
  wheelCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  wheelCenterText: {
    fontSize: 24,
  },
  spinButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 180,
  },
  spinButtonDisabled: {
    backgroundColor: '#555',
  },
  spinButtonText: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
  },
  spinCostText: {
    color: '#333',
    fontSize: 12,
    marginTop: 2,
  },
  notEnoughCoins: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  // Cards Section
  cardsSection: {
    marginTop: 8,
  },
  cardsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardItem: {
    width: '23%',
    marginBottom: 12,
    alignItems: 'center',
  },
  cardItemOwned: {
    opacity: 1,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
  },
  cardImageLocked: {
    borderColor: '#222',
  },
  cardLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
  },
  cardName: {
    color: '#fff',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  cardBand: {
    color: '#888',
    fontSize: 8,
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
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  resultCardContainer: {
    marginBottom: 12,
  },
  resultCardImage: {
    width: 140,
    height: 180,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  resultCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  resultBand: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  duplicateBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  duplicateText: {
    color: '#FF9800',
    fontSize: 11,
    textAlign: 'center',
  },
  closeResultButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeResultText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Series Complete Modal
  seriesCompleteContainer: {
    borderColor: '#FFD700',
    backgroundColor: '#1a2a1a',
  },
  seriesCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  seriesCompleteName: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  rareRewardTitle: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rareRewardImage: {
    width: 120,
    height: 160,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#2196F3',
    marginBottom: 8,
  },
  rareRewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  nextSeriesText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 12,
  },
});
