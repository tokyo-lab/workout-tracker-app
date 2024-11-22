import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WorkoutContext } from '../src/context/workoutContext';
import { ProgramContext } from '../src/context/programContext';
import PillButton from '../components/PillButton';
import SwipeableItemDeletion from '../components/SwipeableItemDeletion';
import Header from '../components/Header';
import Set from '../components/Set';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/hooks/useTheme';
import { getThemedStyles } from '../src/utils/themeUtils';
import { globalStyles, colors } from '../src/styles/globalStyles';

const StartWorkoutView = () => {
  const {
    state: workoutState,
    completeWorkout,
    removeExerciseFromWorkout,
    updateExerciseSets
  } = useContext(WorkoutContext);
  const { setMode } = useContext(ProgramContext);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const timerRef = useRef(null);

  const navigation = useNavigation();

  const { state: themeState } = useTheme();
  const themedStyles = getThemedStyles(
    themeState.theme,
    themeState.accentColor
  );

  const workoutDetails = workoutState.workoutDetails;
  const [sets, setSets] = useState(() => {
    const initialSets =
      workoutDetails?.exercises[currentExerciseIndex]?.sets || [];
    return initialSets.map((set, idx) => ({
      ...set,
      id: set.id || Math.random().toString(36).substr(2, 9),
      order: idx + 1
    }));
  });

  console.log('Total exercises:', workoutDetails?.exercises?.length);
  console.log('Current index:', currentExerciseIndex);

  // Effect to update sets when exercise changes
  useEffect(() => {
    const currentSets =
      workoutDetails?.exercises[currentExerciseIndex]?.sets || [];
    setSets(
      currentSets.map((set, idx) => ({
        ...set,
        id: set.id || Math.random().toString(36).substr(2, 9),
        order: idx + 1
      }))
    );
  }, [currentExerciseIndex, workoutDetails?.exercises]);

  // For exercise info auto-hide timer

  useEffect(() => {
    let timer;
    if (showExerciseInfo) {
      timer = setTimeout(() => setShowExerciseInfo(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showExerciseInfo]);

  useEffect(() => {
    setMode('workout');
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // If we don't have a current workout in context but have workout data in route
    if (!workoutState.currentWorkout && route.params?.workout) {
      startWorkout(route.params.workout);
    }
  }, []);

  useEffect(() => {
    if (!workoutDetails) {
      console.error('No workout details available in context');
      navigation.goBack();
      return;
    }
  }, [workoutDetails, navigation]);

  const currentExercise = workoutDetails?.exercises[currentExerciseIndex];

  const handleCancel = () => navigation.goBack();

  const startTimer = () => {
    if (!isStarted) {
      setIsStarted(true);
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isStarted && !isPaused) {
      clearInterval(timerRef.current);
      setIsPaused(true);
    } else if (isStarted && isPaused) {
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  const stopTimer = async () => {
    try {
      clearInterval(timerRef.current);
      setIsStarted(false);
      setIsPaused(false);

      // Calculate duration in minutes
      const durationInMinutes = Math.floor(time / 60);
      console.log('Completing workout with duration:', durationInMinutes);

      // Complete workout with duration directly
      await completeWorkout(durationInMinutes);

      navigation.goBack();
    } catch (error) {
      console.error('Failed to complete workout:', error);
      Alert.alert('Error', `Failed to save workout: ${error.message}`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    }
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // Add leading zeros using padStart
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `T+${formattedMinutes}:${formattedSeconds}`;
  };

  const handlePause = () => pauseTimer();

  const handleAddExercises = () => {
    navigation.navigate('ExerciseSelection', {
      mode: 'workout',
      isNewProgram: false,
      programId: workoutState.currentWorkout?.id
    });
  };

  const handleDeleteExercise = exerciseId => {
    removeExerciseFromWorkout(exerciseId);

    // Parent component can handle additional logic
    if (currentExerciseIndex >= workoutDetails.exercises.length - 1) {
      setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1));
    }
  };

  const handleNextExercise = () => {
    console.log('Next button pressed');
    console.log(
      'Can go next:',
      currentExerciseIndex < workoutDetails?.exercises?.length - 1
    );
    if (currentExerciseIndex < workoutDetails.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      const nextSets =
        workoutDetails.exercises[currentExerciseIndex + 1]?.sets || [];
      setSets(
        nextSets.map((set, idx) => ({
          ...set,
          id: set.id || Math.random().toString(36).substr(2, 9),
          order: idx + 1
        }))
      );
    }
  };

  const handlePreviousExercise = () => {
    console.log('Previous button pressed');
    console.log('Can go previous:', currentExerciseIndex > 0);
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      const prevSets =
        workoutDetails.exercises[currentExerciseIndex - 1]?.sets || [];
      setSets(
        prevSets.map((set, idx) => ({
          ...set,
          id: set.id || Math.random().toString(36).substr(2, 9),
          order: idx + 1
        }))
      );
    }
  };

  const handleAddSet = () => {
    setSets(currentSets => {
      const newSet = {
        id: Math.random().toString(36).substr(2, 9),
        weight: '0',
        reps: '0',
        order: currentSets.length + 1
      };

      const newSets = [...currentSets, newSet];

      // Sync with context
      const currentExercise = workoutDetails?.exercises[currentExerciseIndex];
      if (currentExercise) {
        updateExerciseSets(currentExercise.id, newSets);
      }

      return newSets;
    });
  };

  const handleSetChange = (index, field, value) => {
    setSets(currentSets => {
      const newSets = currentSets.map(set => {
        if (set.order === index + 1) {
          return { ...set, [field]: value };
        }
        return set;
      });

      // Sync with context
      const currentExercise = workoutDetails?.exercises[currentExerciseIndex];
      if (currentExercise) {
        updateExerciseSets(currentExercise.id, newSets);
      }

      return newSets;
    });
  };

  const handleDeleteSet = setId => {
    setSets(currentSets => {
      const newSets = currentSets
        .filter(s => String(s.id) !== String(setId))
        .map((s, idx) => ({
          ...s,
          order: idx + 1
        }));

      // Sync with context
      const currentExercise = workoutDetails?.exercises[currentExerciseIndex];
      if (currentExercise) {
        updateExerciseSets(currentExercise.id, newSets);
      }

      return newSets;
    });
  };

  // delete exercise action

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: themedStyles.primaryBackgroundColor }
      ]}
    >
      <Header pageName='WORKOUT' />
      <View style={styles.header}>
        <Text style={[styles.workoutName, { color: themedStyles.textColor }]}>
          {workoutDetails?.name}
        </Text>
      </View>
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={[
            globalStyles.button,
            styles.startButton,
            { backgroundColor: themedStyles.accentColor }
          ]}
          onPress={isStarted ? stopTimer : startTimer}
        >
          <Text style={styles.startButtonText}>
            {isStarted ? 'COMPLETE WORKOUT' : 'START WORKOUT'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePause}
          style={[
            styles.pauseButton,
            { backgroundColor: themedStyles.accentColor },
            !isStarted && styles.disabledButton
          ]}
          disabled={!isStarted}
        >
          <Ionicons
            name={isPaused ? 'play-outline' : 'pause-outline'}
            size={24}
            style={[styles.pauseIcon, !isStarted && styles.disabledIcon]}
          />
        </TouchableOpacity>
        <Text
          style={[styles.timerDisplay, { color: themedStyles.accentColor }]}
        >
          {formatTime(time)}
        </Text>
      </View>

      {/* exercise start */}
      <SafeAreaView
        style={[
          globalStyles.container,
          { backgroundColor: themedStyles.primaryBackgroundColor }
        ]}
      >
        <View style={styles.swipeableContainer}>
          {/* Previous Navigation Button */}
          <View style={[styles.navigationWrapper, styles.topNavigationWrapper]}>
            <TouchableOpacity
              onPress={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
              style={[
                styles.navigationButton,
                currentExerciseIndex === 0 && styles.disabledButton
              ]}
            >
              <Ionicons
                name='chevron-up-outline'
                size={24}
                style={{
                  color: themeState.accentColor,
                  opacity: currentExerciseIndex === 0 ? 0.3 : 1
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Swipeable Content */}
          <SwipeableItemDeletion
            swipeableType='workout'
            onDelete={() => handleDeleteExercise(currentExercise?.id)}
          >
            <View
              style={[
                styles.exerciseContainer,
                { backgroundColor: themedStyles.secondaryBackgroundColor }
              ]}
            >
              {/* <View style={styles.exerciseInfo}>
                <Text
                  style={[
                    styles.exerciseNumber,
                    { color: themedStyles.textColor }
                  ]}
                >
                  {currentExerciseIndex + 1}
                </Text>
                <View>
                  <Text
                    style={[
                      styles.exerciseName,
                      { color: themedStyles.textColor }
                    ]}
                  >
                    {currentExercise?.name}
                  </Text>
                  <Text
                    style={[
                      styles.muscleName,
                      { color: themedStyles.textColor }
                    ]}
                  >
                    {currentExercise?.muscle}
                  </Text>
                </View>
              </View> */}
              <View style={styles.exerciseImage}>
                <View style={styles.imageOverlay} />
                {currentExercise?.imageUrl || currentExercise?.file_url ? (
                  <Image
                    source={{
                      uri: currentExercise.imageUrl || currentExercise.file_url
                    }}
                    style={styles.exerciseGif}
                    resizeMode='contain'
                  />
                ) : (
                  <View style={styles.placeholderImage} />
                )}
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => setShowExerciseInfo(true)}
                >
                  <Ionicons
                    name='information-circle'
                    size={24}
                    color={themeState.accentColor}
                  />
                </TouchableOpacity>

                {showExerciseInfo && (
                  <View style={styles.infoOverlay}>
                    <Text style={styles.exerciseName}>
                      {currentExercise?.name}
                    </Text>
                    <Text style={styles.muscleName}>
                      {currentExercise?.muscle}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </SwipeableItemDeletion>

          {/* Next Navigation Button */}
          <View
            style={[styles.navigationWrapper, styles.bottomNavigationWrapper]}
          >
            <TouchableOpacity
              onPress={handleNextExercise}
              disabled={
                currentExerciseIndex === workoutDetails?.exercises.length - 1
              }
              style={[
                styles.navigationButton,
                currentExerciseIndex === workoutDetails?.exercises.length - 1 &&
                  styles.disabledButton
              ]}
            >
              <Ionicons
                name='chevron-down-outline'
                size={24}
                style={{
                  color: themeState.accentColor,
                  opacity:
                    currentExerciseIndex ===
                    workoutDetails?.exercises.length - 1
                      ? 0.3
                      : 1
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      {/* exercise end */}

      <View style={styles.setControls}>
        {/* setHeader */}
        <View
          style={[
            styles.setHeader,
            { backgroundColor: themedStyles.secondaryBackgroundColor }
          ]}
        >
          <Text
            style={[styles.setHeaderText, { color: themedStyles.textColor }]}
          >
            Set
          </Text>
          <Text
            style={[
              styles.setHeaderText,
              styles.setWeight,
              { color: themedStyles.textColor }
            ]}
          >
            Weight
          </Text>
          <Text
            style={[
              styles.setHeaderText,
              styles.setReps,
              { color: themedStyles.textColor }
            ]}
          >
            Reps
          </Text>
        </View>
        <ScrollView
          style={styles.setsScrollView}
          contentContainerStyle={styles.setsScrollContent}
          showsVerticalScrollIndicator={true}
        >
          {sets.length === 0 && (
            <Text
              style={{
                color: themedStyles.textColor,
                textAlign: 'center',
                fontFamily: 'Lexend',
                marginTop: 10
              }}
            >
              {' '}
              No Sets
            </Text>
          )}
          {sets.map((set, index) => (
            <Set
              key={set.id}
              index={set.order - 1}
              set={set}
              isLast={index === sets.length - 1}
              onSetChange={handleSetChange}
              onDelete={handleDeleteSet}
              themedStyles={themedStyles}
            />
          ))}
        </ScrollView>
        <PillButton
          label='Add Set'
          style={styles.addSetButton}
          icon={
            <Ionicons
              name='add-outline'
              size={16}
              style={{
                color:
                  themeState.theme === 'dark'
                    ? themedStyles.accentColor
                    : colors.eggShell
              }}
            />
          }
          onPress={handleAddSet}
        />
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[
            styles.bottomButton,
            { backgroundColor: themedStyles.secondaryBackgroundColor }
          ]}
          onPress={() => handleAddExercises(workoutDetails.id)}
        >
          <Text
            style={[
              styles.bottomButtonText,
              { color: themedStyles.accentColor }
            ]}
          >
            ADD EXERCISE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.bottomButton,
            { backgroundColor: themedStyles.secondaryBackgroundColor }
          ]}
          onPress={handleCancel}
        >
          <Text
            style={[
              styles.bottomButtonText,
              { color: themedStyles.accentColor }
            ]}
          >
            CANCEL
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 5,
    alignItems: 'center'
  },
  workoutName: {
    fontSize: 16,
    fontFamily: 'Lexend'
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 5
  },
  startButton: {
    width: 190,
    height: 35,
    padding: 9
  },
  startButtonText: {
    color: colors.flatBlack,
    fontSize: 14,
    fontFamily: 'Lexend'
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pauseIcon: {
    color: colors.flatBlack
  },
  timerDisplay: {
    fontSize: 26,
    fontFamily: 'Tiny5'
  },
  swipeableContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10
  },
  exerciseContainer: {
    padding: 10,

    height: 350,
    display: 'flex',
    width: '100%'
  },
  exerciseContent: {
    flex: 1,
    position: 'relative'
  },
  imageNavigationContainer: {
    flex: 1,
    marginTop: 10,
    position: 'relative'
  },
  navigationWrapper: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -20 }],
    alignItems: 'center',
    zIndex: 10
  },
  topNavigationWrapper: {
    top: 5
  },

  bottomNavigationWrapper: {
    bottom: -155
  },
  navigationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    zIndex: 20
  },
  exerciseImage: {
    width: '100%',
    height: 330,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(1px)',
    zIndex: 1
  },
  exerciseGif: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#444'
  },
  setControls: {
    marginTop: 160,

    flex: 1,
    gap: 3,
    paddingHorizontal: 5,
    paddingBottom: 10
  },
  setsScrollView: {
    flexGrow: 0
  },
  setsScrollContent: {
    gap: 2,
    flexGrow: 0
  },

  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },

  setHeaderText: {
    flex: 1,
    fontSize: 16,
    padding: 1,
    textAlign: 'center',
    fontFamily: 'Lexend',
    marginRight: 10
  },

  setWeight: {
    marginRight: 80
  },

  setReps: {
    marginRight: 55
  },
  addSetButton: {
    marginTop: 6,
    marginLeft: 5,
    height: 25
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5
  },
  bottomButton: {
    flex: 1,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10
  },
  bottomButtonText: {
    fontSize: 14,
    fontFamily: 'Lexend'
  },
  disabledButton: {
    opacity: 0.5
  },
  disabledIcon: {
    opacity: 0.5
  },
  infoButton: {
    position: 'absolute',
    top: 10,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 4
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10
  }
});

export default StartWorkoutView;
