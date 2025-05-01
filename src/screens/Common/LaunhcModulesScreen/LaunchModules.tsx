import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../../modules/walletProviders/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import Icons from '../../../assets/svgs';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { AppHeader } from '@/core/sharedUI';

// Commented sections to be re-enabled later if needed
const modules = [
  {
    key: 'pumpfun',
    title: 'Pumpfun',
    subtitle: 'The OG Solana Launchpad',
    navigateTo: 'Pumpfun',
    iconImage: require('@/assets/images/Pumpfun_logo.png'),
    backgroundImage: require('@/assets/images/Pumpfun_bg.png'),
    usePngIcon: true,
  },
  // {
  //   key: 'pumpswap',
  //   title: 'Pump Swap',
  //   description:
  //     'Swap tokens, add/remove liquidity, and create pools on the Solana blockchain.',
  //   backgroundColor: '#BBDEFB',
  //   navigateTo: 'PumpSwap',
  // },
  {
    key: 'launchlab',
    title: 'Launch Lab',
    subtitle: 'Launch Tokens via Rayduim',
    navigateTo: 'LaunchlabsScreen',
    iconComponent: Icons.RadyuimIcom,
    backgroundImage: require('@/assets/images/Rayduim_bg.png'),
  },
  {
    key: 'tokenmill',
    title: 'Token Mill',
    subtitle: 'Launch tokens with customizable bonding curve',
    navigateTo: 'TokenMill',
    iconComponent: Icons.TokenMillIcon,
    backgroundImage: require('@/assets/images/TokenMill_bg.png'),
  },
  // {
  //   key: 'nft',
  //   title: 'NFT Screen',
  //   description:
  //     'Browse, buy, and sell NFTs with integrated wallet support and listing functionality.',
  //   backgroundColor: '#E1BEE7',
  //   navigateTo: 'NftScreen',
  // },
];

// Define styles for the LaunchPads screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
    marginLeft: 4,
    textAlign: 'center',
  },
  launchCard: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '75%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.greyLight,
    marginTop: 2,
  },
  launchButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 8,
  },
  launchButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  loggingOutContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  loggingOutText: {
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  }
});

// Android specific styles
const androidStyles = StyleSheet.create({
  safeArea: {
    paddingTop: 30,
  },
});

export default function ModuleScreen() {
  // State to track logout process
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get the auth object and navigation
  const auth = useAuth();
  const navigation = useNavigation();

  // Safely extract logout function
  const logout = auth?.logout || (() => Promise.resolve());

  // Create a safe logout handler
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    try {
      setIsLoggingOut(true);
      console.log('Logging out...');

      // Use setTimeout to ensure state update is processed before logout
      setTimeout(async () => {
        try {
          await logout();
          console.log('Logout successful');
        } catch (error) {
          console.error('Error during logout:', error);
          Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
        } finally {
          // Keep this state true - we don't need to reset it as the component
          // will be unmounted during navigation changes
        }
      }, 100);
    } catch (error) {
      console.error('Error initiating logout:', error);
      setIsLoggingOut(false);
    }
  }, [logout, isLoggingOut]);

  const handlePress = useCallback((module: any) => {
    if (module.navigateTo && !isLoggingOut) {
      navigation.navigate(module.navigateTo as never);
    }
  }, [navigation, isLoggingOut]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render a loading overlay during logout
  const renderLoggingOutOverlay = () => {
    if (!isLoggingOut) return null;

    return (
      <View style={styles.loggingOutContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loggingOutText}>Logging out...</Text>
      </View>
    );
  };

  // Render a launch card
  const renderLaunchCard = (module: any) => {
    const IconComponent = module.iconComponent;

    return (
      <View key={module.key} style={styles.launchCard}>
        <ImageBackground
          source={module.backgroundImage}
          style={styles.cardBackground}
          resizeMode="cover"
        >
          <BlurView
            intensity={45}
            tint="dark"
            style={styles.cardFooter}
          >
            <View style={styles.cardInfo}>
              <View style={styles.iconContainer}>
                {module.usePngIcon ? (
                  <Image
                    source={module.iconImage}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                ) : module.key === 'launchlab' ? (
                  <IconComponent width={32} height={32} color="#F5C05E" />
                ) : (
                  <IconComponent width={32} height={32} color={COLORS.white} />
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{module.title}</Text>
                <Text style={styles.cardSubtitle}>{module.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.launchButton}
              onPress={() => handlePress(module)}
            >
              <Text style={styles.launchButtonText}>Launch</Text>
            </TouchableOpacity>
          </BlurView>
        </ImageBackground>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === 'android' && androidStyles.safeArea,
      ]}>
      {renderLoggingOutOverlay()}

      {/* Replace custom header with reusable AppHeader */}
      <AppHeader 
        title="Launchpads"
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Launch via</Text>

        {/* Only render active modules */}
        {modules.map(module => renderLaunchCard(module))}
      </ScrollView>
    </SafeAreaView>
  );
}
