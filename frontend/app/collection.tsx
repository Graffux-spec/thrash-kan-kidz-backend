import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { FlashList } from '@shopify/flash-list';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface Card {
  id: string;
  name: string;
  description: string;
  rarity: string;
  front_image_url: string;
  back_image_url: string;
  coin_cost: number;
  series?: number;
  band?: string;
  card_type?: string;
  base_card_id?: string;
  variant_name?: string;
}

interface UserCard {
  user_card_id: string;
  card: Card;
  quantity: number;
  acquired_at: string;
}

// Simple Card Component - No animations for now
const SimpleCard = ({ 
  userCard, 
  onPress 
}: { 
  userCard: UserCard; 
  onPress: () => void;
}) => {
  const isVariant = !!userCard.card.base_card_id;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.cardContainer, isVariant && styles.variantCardBorder]}>
      <Image
        source={{ uri: userCard.card.front_image_url }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      {userCard.quantity > 1 && (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>x{userCard.quantity}</Text>
        </View>
      )}
      {isVariant && (
        <View style={styles.variantBadge}>
          <Text style={styles.variantBadgeText}>VAR</Text>
        </View>
      )}
      <View style={styles.cardNameBadge}>
        <Text style={styles.cardNameText} numberOfLines={1}>
          {userCard.card.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function CollectionScreen() {
  const { user, userCards, allCards, apiUrl, refreshData } = useApp();
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [showFront, setShowFront] = useState(true);
  const [tradeInEligible, setTradeInEligible] = useState<any[]>([]);
  const [showTradeInResult, setShowTradeInResult] = useState(false);
  const [tradeInResult, setTradeInResult] = useState<any>(null);
  const [isTrading, setIsTrading] = useState(false);

  const BACKGROUND_IMAGE = 'https://customer-assets.emergentagent.com/job_earn-cards/artifacts/zgy2com2_enhanced-1771247671181.jpg';

  useEffect(() => {
    if (user) {
      fetchTradeInEligible();
    }
  }, [user, userCards]);

  const fetchTradeInEligible = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${apiUrl}/api/users/${user.id}/trade-in-eligible`);
      const data = await response.json();
      setTradeInEligible(data.eligible_cards || []);
    } catch (error) {
      console.error('Error fetching trade-in eligible cards:', error);
    }
  };

  const handleTradeIn = async (cardId: string) => {
    if (!user || isTrading) return;
    
    setIsTrading(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/${user.id}/trade-in/${cardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      
      if (data.success) {
        setTradeInResult(data);
        setShowTradeInResult(true);
        refreshData();
        fetchTradeInEligible();
      } else {
        Alert.alert('Trade-In Failed', data.detail || 'Could not complete trade-in');
      }
    } catch (error) {
      console.error('Trade-in error:', error);
      Alert.alert('Error', 'Failed to complete trade-in');
    } finally {
      setIsTrading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: BACKGROUND_IMAGE }} style={styles.backgroundImage} resizeMode="cover" />
        <View style={styles.backgroundOverlay} />
        <View style={styles.centerContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockedText}>Please login to view your collection</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ownedBaseCards = userCards.filter(uc => !uc.card.base_card_id);
  const ownedVariants = userCards.filter(uc => uc.card.base_card_id);
  
  const ownedSeries1Commons = ownedBaseCards.filter(uc => uc.card.series === 1 && uc.card.rarity === 'common').length;
  const ownedSeries2Commons = ownedBaseCards.filter(uc => uc.card.series === 2 && uc.card.rarity === 'common').length;
  const ownedSeries3Commons = ownedBaseCards.filter(uc => uc.card.series === 3 && uc.card.rarity === 'common').length;
  
  const totalOwned = userCards.length;
  const filteredCards = userCards;

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: BACKGROUND_IMAGE }} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.backgroundOverlay} />
      <View style={styles.header}>
        <Text style={styles.title}>My Collection</Text>
        <Text style={styles.subtitle}>
          {totalOwned} Cards Collected
        </Text>
        <View style={styles.seriesProgress}>
          <Text style={styles.seriesProgressText}>S1: {ownedSeries1Commons}/16</Text>
          <Text style={styles.seriesProgressText}>S2: {ownedSeries2Commons}/16</Text>
          <Text style={styles.seriesProgressText}>S3: {ownedSeries3Commons}/16</Text>
          {ownedVariants.length > 0 && (
            <Text style={styles.variantProgressText}>+{ownedVariants.length} Variants</Text>
          )}
        </View>
      </View>

      {tradeInEligible.length > 0 && (
        <View style={styles.tradeInSection}>
          <Text style={styles.tradeInTitle}>🔄 Trade-In for Variants</Text>
          <Text style={styles.tradeInSubtitle}>Trade 5 duplicates for a rare variant!</Text>
          {tradeInEligible.map((item) => (
            <View key={item.card.id} style={styles.tradeInCard}>
              <Image 
                source={{ uri: item.card.front_image_url }}
                style={styles.tradeInImage}
                resizeMode="cover"
              />
              <View style={styles.tradeInInfo}>
                <Text style={styles.tradeInName}>{item.card.name}</Text>
                <Text style={styles.tradeInQuantity}>
                  {item.quantity} duplicates • {item.variants_owned}/{item.variants_total} variants
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.tradeInButton, isTrading && styles.tradeInButtonDisabled]}
                onPress={() => handleTradeIn(item.card.id)}
                disabled={isTrading}
              >
                <Text style={styles.tradeInButtonText}>
                  {isTrading ? '...' : 'TRADE IN'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {filteredCards.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🃏</Text>
          <Text style={styles.emptyStateTitle}>No Cards Yet!</Text>
          <Text style={styles.emptyStateSubtitle}>
            Head to the Shop to open some card packs and start your collection!
          </Text>
        </View>
      ) : (
        <View style={styles.flashListContainer}>
          <FlashList
            data={filteredCards}
            renderItem={({ item: uc }) => (
              <SimpleCard
                key={uc.user_card_id}
                userCard={uc}
                onPress={() => {
                  setSelectedCard(uc);
                  setShowFront(true);
                }}
              />
            )}
            keyExtractor={(item) => item.user_card_id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flashListContent}
          />
        </View>
      )}

      {/* Trade-In Result Modal */}
      <Modal
        visible={showTradeInResult}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTradeInResult(false)}
      >
        <View style={styles.tradeResultOverlay}>
          <View style={styles.tradeResultModal}>
            <Text style={styles.tradeResultTitle}>🎉 Trade Complete!</Text>
            {tradeInResult && (
              <>
                <Text style={styles.tradeResultText}>
                  You received a {tradeInResult.variant_received?.variant_name} variant!
                </Text>
                <Image
                  source={{ uri: tradeInResult.variant_received?.front_image_url }}
                  style={styles.tradeResultImage}
                  resizeMode="contain"
                />
              </>
            )}
            <TouchableOpacity
              style={styles.tradeResultButton}
              onPress={() => setShowTradeInResult(false)}
            >
              <Text style={styles.tradeResultButtonText}>AWESOME!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Card Detail Modal */}
      <Modal
        visible={selectedCard !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedCard(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedCard(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {selectedCard && (
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <TouchableOpacity onPress={() => setShowFront(!showFront)}>
                  <Image
                    source={{ uri: showFront ? selectedCard.card.front_image_url : selectedCard.card.back_image_url }}
                    style={styles.modalCardImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <Text style={styles.tapHint}>Tap card to flip</Text>

                <View style={styles.modalCardInfo}>
                  <Text style={styles.modalCardName}>{selectedCard.card.name}</Text>
                  {selectedCard.card.variant_name && (
                    <Text style={styles.modalVariantName}>{selectedCard.card.variant_name} Variant</Text>
                  )}
                  <Text style={styles.modalCardRarity}>
                    {selectedCard.card.rarity?.toUpperCase()} • Series {selectedCard.card.series}
                  </Text>
                  <Text style={styles.modalCardDescription}>
                    {selectedCard.card.description}
                  </Text>
                  <Text style={styles.modalQuantity}>
                    Owned: x{selectedCard.quantity}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 4,
  },
  seriesProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  seriesProgressText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  variantProgressText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: 'bold',
  },
  flashListContainer: {
    flex: 1,
  },
  flashListContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  variantCardBorder: {
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  quantityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  quantityText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  variantBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#9C27B0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  variantBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardNameBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cardNameText: {
    color: '#fff',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tradeInSection: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  tradeInTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E1BEE7',
    textAlign: 'center',
  },
  tradeInSubtitle: {
    fontSize: 12,
    color: '#CE93D8',
    textAlign: 'center',
    marginBottom: 8,
  },
  tradeInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  tradeInImage: {
    width: 40,
    height: 60,
    borderRadius: 4,
  },
  tradeInInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tradeInName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tradeInQuantity: {
    color: '#aaa',
    fontSize: 11,
  },
  tradeInButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tradeInButtonDisabled: {
    opacity: 0.5,
  },
  tradeInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tradeResultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradeResultModal: {
    backgroundColor: '#2a2a4a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  tradeResultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  tradeResultText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  tradeResultImage: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  tradeResultButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tradeResultButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  modalScrollContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  modalCardImage: {
    width: width * 0.7,
    height: width * 1.05,
    borderRadius: 12,
  },
  tapHint: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  modalCardInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  modalVariantName: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalCardRarity: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  modalCardDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  modalQuantity: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 12,
    fontWeight: 'bold',
  },
});
