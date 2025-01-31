// src/components/thread/ThreadComposer.tsx

import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';

interface ThreadComposerProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

const ThreadComposer: React.FC<ThreadComposerProps> = ({
  onSubmit,
  placeholder,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length > 0) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder || 'Write a reply...'}
        style={styles.input}
        value={text}
        onChangeText={setText}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default ThreadComposer;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
});
