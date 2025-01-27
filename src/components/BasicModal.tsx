import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface BasicModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const BasicModal: React.FC<BasicModalProps> = ({
  visible,
  onClose,
  title = 'Modal Title',
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {children}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BasicModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  closeText: {
    color: '#007BFF',
    fontSize: 16,
  },
});
