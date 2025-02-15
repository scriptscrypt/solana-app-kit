import React from 'react';
import { View } from 'react-native';
import { BlinkExample } from '../components/BlinkRequestCard/BlinkRequestCard';



const BlinkScreen: React.FC = () => {
  const actionUrl =
    'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fsnakes.sendarcade.fun%2Fapi%2Factions%2Fgame%3F_brf%3Df722eb4a-297a-447b-aa1f-62f870b789fe%26_bin%3Dab63b0bf-abbd-4354-bb55-855309118e6a';

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BlinkExample url={actionUrl} />
    </View>
  );
};

export default BlinkScreen; 