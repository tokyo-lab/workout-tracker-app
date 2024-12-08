import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WorkoutContext } from '../src/context/workoutContext';
import Header from '../components/Header';
import { getThemedStyles } from '../src/utils/themeUtils';
import { useTheme } from '../src/hooks/useTheme';
import { colors } from '../src/styles/globalStyles';

const WorkoutView = () => {
  const { state: themeState } = useTheme();
  const themedStyles = getThemedStyles(
    themeState.theme,
    themeState.accentColor
  );

  const {
    state: workoutState,
    clearWorkoutDetails,
    clearCurrentWorkout,
    fetchActiveProgramDetails
  } = useContext(WorkoutContext);

  const navigation = useNavigation();

  // When component mounts, fetch active program details
  useEffect(() => {
    const loadActiveProgram = async () => {
      try {
        await fetchActiveProgramDetails();
      } catch (error) {
        console.error('Error loading active program:', error);
        // You might want to show an error message to the user here
      }
    };

    loadActiveProgram();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleProgramWorkoutPress = async () => {
    // Let's log the current state to understand what we're working with
    console.log(
      'Program workout pressed. Active program:',
      workoutState.activeProgram
    );
    console.log('Full workout state:', workoutState);

    if (workoutState.activeProgram) {
      console.log('Attempting to navigate to CurrentProgramDetails');
      navigation.navigate('CurrentProgramDetails');
      console.log('Navigation called');
    } else {
      console.log('No active program, navigating to program selection');
      clearWorkoutDetails();
      clearCurrentWorkout();
      navigation.navigate('CurrentProgram');
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: themedStyles.primaryBackgroundColor }
      ]}
    >
      <Header pageName='Workout' />
      <View style={[styles.container]}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleProgramWorkoutPress}
        >
          <ImageBackground
            source={require('../assets/images/workout-1.jpg')}
            style={styles.image}
          >
            <View style={styles.lightenOverlay} />
            <View style={styles.textOverlay}>
              <Text style={[styles.imageText, { color: colors.offWhite }]}>
                {workoutState.activeProgram
                  ? 'Continue Current Program'
                  : 'Start Workout Using a Program'}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => {
            navigation.navigate('FlexWorkout');
          }}
        >
          <ImageBackground
            source={require('../assets/images/workout-2.jpg')}
            style={styles.image}
          >
            <View style={styles.lightenOverlay} />
            <View style={styles.textOverlay}>
              <Text style={[styles.imageText, { color: colors.offWhite }]}>
                Start a Flex{'\n'}Workout
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1
  },
  imageContainer: {
    flex: 1
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  lightenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    opacity: 0.1
  },
  textOverlay: {
    padding: 20
  },
  imageText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default WorkoutView;
