# Solana App Kit - Directory Structure

```
solana-app-kit/
├── .git/
├── .github/
├── android/
├── docs/
├── ios/
│   ├── Podfile
│   ├── Podfile.lock
│   ├── Podfile.properties.json
│   ├── SolanaAppKit/
│   │   ├── AppDelegate.h
│   │   ├── AppDelegate.mm
│   │   ├── Images.xcassets/
│   │   │   ├── AppIcon.appiconset/
│   │   │   │   ├── App-Icon-1024x1024@1x.png
│   │   │   │   └── Contents.json
│   │   │   ├── Contents.json
│   │   │   └── SplashScreenBackground.colorset/
│   │   │       └── Contents.json
│   │   ├── Info.plist
│   │   ├── main.m
│   │   ├── noop-file.swift
│   │   ├── PrivacyInfo.xcprivacy
│   │   ├── SolanaAppKit-Bridging-Header.h
│   │   ├── SolanaAppKit.entitlements
│   │   ├── SplashScreen.storyboard
│   │   └── Supporting/
│   │       └── Expo.plist
│   ├── SolanaAppKit.xcodeproj/
│   │   ├── project.pbxproj
│   │   └── xcshareddata/
│   │       └── xcschemes/
│   │           └── SolanaAppKit.xcscheme
│   └── SolanaAppKit.xcworkspace/
│       └── contents.xcworkspacedata
├── scripts/
│   └── start.js
├── server/
│   ├── cloudbuild.yaml.example
│   ├── CONTRIBUTING.md
│   ├── deploy.sh.example
│   ├── Dockerfile
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── README.md
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── chatController.ts
│   │   │   ├── jupiterSwapController.ts
│   │   │   ├── raydiumSwapController.ts
│   │   │   ├── README.md
│   │   │   ├── threadController.ts
│   │   │   └── uploadMetadataController.ts
│   │   ├── db/
│   │   │   ├── knex.ts
│   │   │   ├── knexfile.ts
│   │   │   ├── migrations/
│   │   │   │   └── [migration files]
│   │   │   └── README.md
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── aura/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── feed/
│   │   │   ├── meteora/
│   │   │   ├── meteoraDBCRoutes.ts
│   │   │   ├── nft/
│   │   │   ├── pumpfun/
│   │   │   ├── raydium/
│   │   │   ├── README.md
│   │   │   ├── swap/
│   │   │   ├── tokenmill/
│   │   │   └── user/
│   │   ├── service/
│   │   │   ├── metaplex/
│   │   │   ├── MeteoraDBC/
│   │   │   ├── pumpSwap/
│   │   │   ├── raydium/
│   │   │   ├── README.md
│   │   │   ├── TokenMill/
│   │   │   ├── userService.ts
│   │   │   └── websocketService.ts
│   │   ├── types/
│   │   │   ├── aura/
│   │   │   ├── interfaces.ts
│   │   │   └── README.md
│   │   └── utils/
│   │       ├── connection.ts
│   │       ├── feeUtils.ts
│   │       ├── gcs.ts
│   │       ├── ipfs.ts
│   │       ├── README.md
│   │       └── tokenMillHelpers.ts
│   ├── tsconfig.json
│   ├── .dockerignore
│   ├── .gcloudignore
│   └── .gitignore
├── src/
│   ├── assets/
│   │   ├── colors.ts
│   │   ├── images/
│   │   │   └── [image files]
│   │   ├── svgs/
│   │   │   ├── login-elements-left/
│   │   │   ├── login-elements-right/
│   │   │   └── [svg files]
│   │   └── typography.ts
│   ├── core/
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── dev-mode/
│   │   │   ├── DevDrawer.tsx
│   │   │   ├── DevModeActivator.tsx
│   │   │   ├── DevModeStatusBar.tsx
│   │   │   ├── DevModeTrigger.tsx
│   │   │   ├── DevModeWrapper.tsx
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── shared-ui/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── EnvErrors/
│   │   │   ├── index.ts
│   │   │   ├── NFTCollectionDrawer/
│   │   │   ├── README.md
│   │   │   ├── TokenDetailsDrawer/
│   │   │   ├── TradeCard/
│   │   │   ├── TransactionNotification.tsx
│   │   │   └── TrendingTokenDetails/
│   │   └── thread/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── index.ts
│   │       ├── README.md
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   ├── modules/
│   │   ├── data-module/
│   │   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── mercuryo/
│   │   ├── meteora/
│   │   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── moonpay/
│   │   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── nft/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── pump-fun/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── navigation/
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── raydium/
│   │   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── solana-agent-kit/
│   │   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── lib/
│   │   │   └── README.md
│   │   ├── swap/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   └── services/
│   │   ├── token-mill/
│   │   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── README.md
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── wallet-providers/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── index.ts
│   │       ├── README.md
│   │       ├── services/
│   │       └── types/
│   ├── screens/
│   │   ├── Common/
│   │   │   ├── DeleteAccountConfirmationScreen.tsx
│   │   │   ├── index.ts
│   │   │   ├── intro-screen/
│   │   │   ├── launch-modules-screen/
│   │   │   ├── login-screen/
│   │   │   └── WebViewScreen.tsx
│   │   ├── index.ts
│   │   ├── README.md
│   │   └── sample-ui/
│   │       ├── chat/
│   │       ├── index.ts
│   │       └── Threads/
│   └── shared/
│       ├── config/
│       │   ├── constants.ts
│       │   ├── CustomizationProvider.tsx
│       │   ├── index.ts
│       │   └── README.md
│       ├── context/
│       │   ├── DevModeContext.tsx
│       │   ├── EnvErrorContext.tsx
│       │   └── README.md
│       ├── hooks/
│       │   ├── README.md
│       │   ├── useAppNavigation.ts
│       │   ├── useEnvCheck.tsx
│       │   └── useReduxHooks.ts
│       ├── mocks/
│       │   ├── portfolio.ts
│       │   ├── posts.ts
│       │   ├── profileInfoData.ts
│       │   ├── README.md
│       │   ├── tweets.ts
│       │   └── users.ts
│       ├── navigation/
│       │   ├── AnimatedTabIcon.tsx
│       │   ├── MainTabs.tsx
│       │   ├── README.md
│       │   └── RootNavigator.tsx
│       ├── README.md
│       ├── services/
│       │   ├── README.md
│       │   ├── rugCheckService.ts
│       │   ├── socketService.ts
│       │   └── transactions/
│       ├── state/
│       │   ├── auth/
│       │   ├── chat/
│       │   ├── notification/
│       │   ├── profile/
│       │   ├── README.md
│       │   ├── store.ts
│       │   ├── thread/
│       │   ├── transaction/
│       │   └── users/
│       ├── types/
│       │   ├── custom.d.ts
│       │   ├── env.d.ts
│       │   └── README.md
│       └── utils/
│           ├── common/
│           ├── envValidator.ts
│           ├── fsPolyfill.js
│           ├── IPFSImage.tsx
│           ├── polyfills.ts
│           └── README.md
├── App.tsx
├── app.example.json
├── babel.config.js
├── CONTRIBUTING.md
├── .eslintrc.js
├── Gemfile
├── .gitignore
├── index.js
├── LICENSE
├── metro.config.js
├── mint.json
├── package.json
├── pnpm-lock.yaml
├── .prettierrc.js
├── README.md
├── react-native.config.js
├── SECURITY.md
└── tsconfig.json
``` 