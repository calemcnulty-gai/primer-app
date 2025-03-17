import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { increment, decrement, reset, selectCount } from '../store/slices/counterSlice';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Counter: {count}</ThemedText>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => dispatch(decrement())}
          style={[styles.button, styles.decrementButton]}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => dispatch(reset())}
          style={[styles.button, styles.resetButton]}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => dispatch(increment())}
          style={[styles.button, styles.incrementButton]}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  decrementButton: {
    backgroundColor: '#FF6B6B',
  },
  incrementButton: {
    backgroundColor: '#4ECDC4',
  },
  resetButton: {
    backgroundColor: '#738290',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 