// ============================================
// FriendOverlay - Draw Screen
// Real-time drawing canvas with friend selection
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Canvas, Path, useTouchHandler } from '@shopify/react-native-skia';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../supabase';
import Overlay from '../modules/OverlayModule';

// ============================================
// DrawScreen Component
// ============================================

export default function DrawScreen({ user }) {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const pathRef = useRef([]);

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];

  useEffect(() => {
    loadFriends();
    subscribeToDrawings();
    checkOverlayPermission();
  }, []);

  // ============================================
  // Check Overlay Permission
  // ============================================
  const checkOverlayPermission = async () => {
    try {
      const hasPermission = await Overlay.hasOverlayPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Overlay Permission Required',
          'To receive drawings from friends over other apps, please grant overlay permission.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: () => Overlay.openOverlaySettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Check overlay permission error:', error);
    }
  };

  // ============================================
  // Load Friends
  // ============================================
  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          friend_id,
          profiles:friend_id (
            id,
            username
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      setFriends(data || []);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  // ============================================
  // Subscribe to Drawings (Real-time)
  // ============================================
  const subscribeToDrawings = () => {
    const channel = supabase
      .channel('drawings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drawings',
          filter: `to_id=eq.${user.id}`,
        },
        (payload) => {
          // Friend sent a drawing!
          console.log('🎨 Drawing received:', payload.new);
          
          // Show notification or overlay
          Alert.alert(
            'New Drawing!',
            `${payload.new.from_id} sent you a drawing`,
            [{ text: 'OK' }]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // ============================================
  // Touch Handler for Drawing
  // ============================================
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      setIsDrawing(true);
      pathRef.current = [{ x, y }];
    },
    onActive: ({ x, y }) => {
      if (isDrawing) {
        pathRef.current = [...pathRef.current, { x, y }];
        
        // Update current path in state
        setPaths(prev => {
          const newPaths = [...prev];
          if (newPaths.length > 0) {
            newPaths[newPaths.length - 1] = {
              ...newPaths[newPaths.length - 1],
              points: pathRef.current,
            };
            return newPaths;
          }
          return prev;
        });
      }
    },
    onEnd: () => {
      if (isDrawing && pathRef.current.length > 0) {
        // Save completed path
        setPaths(prev => [
          ...prev,
          {
            points: pathRef.current,
            color: currentColor,
            width: currentWidth,
          },
        ]);
      }
      setIsDrawing(false);
      pathRef.current = [];
    },
  });

  // ============================================
  // Send Drawing to Friend
  // ============================================
  const sendDrawing = async () => {
    if (!selectedFriend) {
      Alert.alert('Error', 'Please select a friend first');
      setShowFriendPicker(true);
      return;
    }

    if (paths.length === 0) {
      Alert.alert('Error', 'Draw something first');
      return;
    }

    try {
      // Convert paths to JSON
      const pathsJSON = JSON.stringify(paths);

      // Send to database (for friend to receive)
      const { error } = await supabase
        .from('drawings')
        .insert({
          from_id: user.id,
          to_id: selectedFriend.friend_id,
          paths: pathsJSON,
          color: currentColor,
        });

      if (error) throw error;

      // Also draw on local overlay (if running)
      await Overlay.drawOnOverlay(paths);

      Alert.alert('Success', 'Drawing sent!');
      clearCanvas();
    } catch (error) {
      console.error('Send drawing error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // Clear Canvas
  // ============================================
  const clearCanvas = () => {
    setPaths([]);
    pathRef.current = [];
  };

  // ============================================
  // Convert Points to SVG Path
  // ============================================
  const pointsToPath = (points) => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // ============================================
  // Render Friend Item
  // ============================================
  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        selectedFriend?.friend_id === item.friend_id && styles.friendItemSelected,
      ]}
      onPress={() => {
        setSelectedFriend(item);
        setShowFriendPicker(false);
      }}
    >
      <Text style={styles.friendName}>{item.profiles?.username || 'Friend'}</Text>
      {selectedFriend?.friend_id === item.friend_id && (
        <Icon name="check-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  // ============================================
  // Render
  // ============================================
  return (
    <View style={styles.container}>
      {/* Friend Selection */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.friendSelector}
          onPress={() => setShowFriendPicker(true)}
        >
          <Icon name="person" size={24} color="#007AFF" />
          <Text style={styles.friendSelectorText}>
            {selectedFriend?.profiles?.username || 'Select Friend'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendDrawing}>
          <Icon name="send" size={24} color="#fff" />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <Canvas style={styles.canvas}>
          {paths.map((path, index) => (
            <Path
              key={index}
              path={pointsToPath(path.points)}
              style="stroke"
              color={path.color}
              strokeWidth={path.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
        </Canvas>
      </View>

      {/* Color Picker */}
      <View style={styles.colorPicker}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              currentColor === color && styles.colorSelected,
            ]}
            onPress={() => setCurrentColor(color)}
          >
            {currentColor === color && (
              <Icon name="check" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Brush Size */}
      <View style={styles.brushSize}>
        <Text style={styles.brushLabel}>Size:</Text>
        {[1, 3, 5, 8].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeOption,
              currentWidth === size && styles.sizeSelected,
            ]}
            onPress={() => setCurrentWidth(size)}
          >
            <View
              style={[
                styles.sizeDot,
                { width: size * 2, height: size * 2 },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Clear Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
        <Icon name="delete" size={24} color="#fff" />
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>

      {/* Friend Picker Modal */}
      <Modal
        visible={showFriendPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFriendPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Friend</Text>
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={(item) => item.id.toString()}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFriendPicker(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  friendSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  friendSelectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  canvas: {
    flex: 1,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  colorSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
  brushSize: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  brushLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  sizeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  sizeSelected: {
    backgroundColor: '#007AFF',
  },
  sizeDot: {
    backgroundColor: '#333',
    borderRadius: 2,
  },
  clearButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  friendName: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});
