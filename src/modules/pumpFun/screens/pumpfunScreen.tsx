import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../walletProviders/hooks/useAuth';
import PumpfunLaunchSection from '../components/PumpfunLaunchSection';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import Icons from '@/assets/svgs';

export default function PumpfunScreen() {
  const { solanaWallet } = useAuth();
  const myWallet = useAppSelector(state => state.auth.address);
  const navigation = useNavigation();

  const userPublicKey = solanaWallet?.wallets?.[0]?.publicKey || myWallet || null;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!userPublicKey) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icons.ArrowLeft width={24} height={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Pump.fun</Text>
          </View>
          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.headerButton}>
              <Icons.copyIcon width={16} height={16} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icons.walletIcon width={35} height={35} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.warnText}>Please connect your wallet first!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icons.ArrowLeft width={24} height={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pump.fun</Text>
        </View>
        <View style={styles.rightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Icons.copyIcon width={16} height={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icons.walletIcon width={35} height={35} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Create a new coin</Text>

        <PumpfunLaunchSection
          containerStyle={styles.cardContainer}
          inputStyle={styles.input}
          buttonStyle={styles.button}
          launchButtonLabel="Go Live!"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  warnText: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily,
    alignSelf: 'center',
  },
  cardContainer: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
    color: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: TYPOGRAPHY.size.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderDarkColor,
    marginBottom: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  button: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
});
