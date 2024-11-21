import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/styles/globalStyles';
import { useTheme } from '../src/hooks/useTheme';
import { getThemedStyles } from '../src/utils/themeUtils';

const SwipeableItemDeletion = ({
  onDelete,
  children,
  isLast,
  swipeableType
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Create an animated value for border radius
  const animatedTopRightRadius = useRef(new Animated.Value(0)).current;
  const animatedBottomRightRadius = useRef(
    new Animated.Value(isLast && swipeableType === 'set' ? 10 : 0)
  ).current;

  const { state: themeState } = useTheme();
  const themedStyles = getThemedStyles(
    themeState.theme,
    themeState.accentColor
  );

  const renderRightActions = progress => {
    // Animated interpolation for the gradient opacity
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    return (
      <Animated.View style={[styles.deleteActionContainer, { opacity }]}>
        <TouchableOpacity onPress={onDelete} style={{ flex: 1 }}>
          <View style={styles.deleteAction}>
            <View style={styles.deleteActionContent}>
              <Ionicons
                name='trash-outline'
                size={24}
                color={colors.eggShell}
              />
            </View>
            {/* Overlay the gradient on top */}
            <LinearGradient
              colors={[themedStyles.secondaryBackgroundColor, colors.red]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, styles.gradient]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const onSwipeableWillOpen = () => {
    setIsOpen(true);
    console.log('onSwipeableWillOpen');
    Animated.parallel([
      Animated.timing(animatedTopRightRadius, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false
      }),
      Animated.timing(animatedBottomRightRadius, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false
      })
    ]).start();
  };

  const onSwipeableWillClose = () => {
    setIsOpen(false);

    Animated.parallel([
      Animated.timing(animatedTopRightRadius, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false
      })
    ]).start();
  };

  const borderRadius = isOpen ? 0 : isLast ? 10 : 0;

  const getBorderRadius = () => {
    if (swipeableType === 'workout') {
      return {
        borderRadius: isOpen ? 0 : 10
      };
    } else {
      // Set type - only bottom right radius if last
      return {
        borderTopRightRadius: 0,
        borderBottomRightRadius: isOpen ? 0 : isLast ? 10 : 0
      };
    }
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={onSwipeableWillOpen}
      onSwipeableWillClose={onSwipeableWillClose}
      overshootRight={false}
    >
      <View
        style={[
          styles.contentContainer,
          children.props.style,
          getBorderRadius(),
          {
            borderTopRightRadius: 0,
            borderBottomRightRadius: borderRadius
          }
        ]}
      >
        {children.props.children}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteActionContainer: {
    width: 80,
    height: '100%'
  },
  deleteAction: {
    flex: 1,
    backgroundColor: colors.red,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden'
  },
  deleteActionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  gradient: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    opacity: 1
  },
  deleteActionText: {
    color: colors.eggShell,
    fontSize: 12,
    marginTop: 4
  }
});

export default SwipeableItemDeletion;
