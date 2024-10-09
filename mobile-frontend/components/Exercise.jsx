import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Crypto from 'expo-crypto';
import { ProgramContext } from '../src/context/programContext';
import { useTheme } from '../src/hooks/useTheme';
import { getThemedStyles } from '../src/utils/themeUtils';
import { globalStyles, colors } from '../src/styles/globalStyles';

const Exercise = ({ exercise, index, workout: initialWorkout }) => {
  const { state, addSet, updateSet, removeSet, updateWorkout } =
    useContext(ProgramContext);
  const workouts = state.workout.workouts;
  const activeWorkout = state.workout.activeWorkout;

  const { mode } = state;
  const { state: themeState } = useTheme();
  const themedStyles = getThemedStyles(
    themeState.theme,
    themeState.accentColor
  );

  // Get the most up-to-date workout data from the state
  const workout = useMemo(() => {
    if (!workouts || !initialWorkout) {
      console.warn('Workouts or initialWorkout is undefined');
      return null;
    }
    return workouts.find(w => w.id === initialWorkout.id) || initialWorkout;
  }, [workouts, initialWorkout]);

  useEffect(() => {
    if (workout) {
      setLocalExercises(workout.exercises);
    }
  }, [workout]);

  const [localExercises, setLocalExercises] = useState(
    workout?.exercises || []
  );

  const handleAddSet = (event, exercise) => {
    event.stopPropagation();
    console.log('Add set button clicked', event.target, event.currentTarget);
    const exerciseId = exercise.id;

    if (!workout || !workout.id) {
      console.error('No active workout found.');
      return;
    }

    // Call the context function to add the set
    addSet(workout.id, exerciseId);

    // Update local state
    setLocalExercises(prevExercises =>
      prevExercises.map(ex =>
        ex.catalog_exercise_id === exercise.catalog_exercise_id
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: Crypto.randomUUID(),
                  order: ex.sets.length + 1,
                  weight: null,
                  reps: null
                }
              ]
            }
          : ex
      )
    );
  };

  const handleUpdateSetLocally = (updatedValue, exerciseId, setId) => {
    setLocalExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.catalog_exercise_id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === setId ? { ...set, ...updatedValue } : set
              )
            }
          : exercise
      )
    );
  };

  const handleUpdateSetOnBlur = (exerciseId, set) => {
    updateSet(workout.id, exerciseId, set);
    // Update context with the latest local exercise data
    updateWorkout({ ...workout, exercises: localExercises });
  };

  const handleRemoveSet = (workoutId, exerciseId, setId) => {
    if (mode === 'edit') {
      setLocalExercises(prevExercises =>
        prevExercises.map(exercise =>
          exercise.catalog_exercise_id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.filter(s => s.id !== setId)
              }
            : exercise
        )
      );

      // Update the context state after local state change
      const updatedExercises = localExercises.map(exercise =>
        exercise.catalog_exercise_id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter(s => s.id !== setId)
            }
          : exercise
      );

      const updatedWorkout = {
        ...workout,
        exercises: updatedExercises
      };

      updateWorkout(updatedWorkout);
    } else {
      removeSet(workoutId, exerciseId, setId);
    }
  };

  const findLocalSet = (exerciseId, setId) => {
    const exercise = localExercises.find(
      e => e.catalog_exercise_id === exerciseId
    );
    return exercise?.sets.find(s => s.id === setId);
  };

  const renderSetInputs = (set, setIndex) => {
    const localSet = findLocalSet(exercise.catalog_exercise_id, set.id);
    if (mode === 'view') {
      return (
        <View key={setIndex} style={styles.setInfo}>
          <Text style={[styles.setText, { color: themedStyles.textColor }]}>
            {set.order}
          </Text>
          <Text style={[styles.setText, { color: themedStyles.textColor }]}>
            {set.weight}
          </Text>
          <Text style={[styles.setText, { color: themedStyles.textColor }]}>
            {set.reps}
          </Text>
        </View>
      );
    } else {
      return (
        <View key={setIndex} style={styles.setInfo}>
          <Text style={[styles.setText, { color: themedStyles.textColor }]}>
            {set.order}
          </Text>
          <TextInput
            style={[
              globalStyles.input,
              styles.input,
              {
                backgroundColor: themedStyles.primaryBackgroundColor,
                color: themedStyles.textColor
              }
            ]}
            value={mode === 'edit' ? localSet?.weight?.toString() ?? '' : ''}
            placeholderTextColor={themedStyles.textColor}
            keyboardType='numeric'
            onTouchStart={event => event.stopPropagation()}
            onChangeText={text =>
              handleUpdateSetLocally(
                { weight: text ? parseInt(text, 10) : null },
                exercise.catalog_exercise_id,
                set.id
              )
            }
            onBlur={() =>
              handleUpdateSetOnBlur(exercise.catalog_exercise_id, set)
            }
          />
          <TextInput
            style={[
              globalStyles.input,
              styles.input,
              {
                backgroundColor: themedStyles.primaryBackgroundColor,
                color: themedStyles.textColor
              }
            ]}
            value={mode === 'edit' ? localSet?.reps?.toString() ?? '' : ''}
            placeholderTextColor={themedStyles.textColor}
            keyboardType='numeric'
            onTouchStart={event => event.stopPropagation()}
            onChangeText={text =>
              handleUpdateSetLocally(
                { reps: text ? parseInt(text, 10) : null },
                exercise.catalog_exercise_id,
                set.id
              )
            }
            onBlur={() =>
              handleUpdateSetOnBlur(exercise.catalog_exercise_id, set)
            }
          />
          {mode !== 'view' && (
            <TouchableOpacity
              onPress={() =>
                handleRemoveSet(
                  workout.id,
                  exercise.catalog_exercise_id,
                  set.id
                )
              }
              style={[
                { backgroundColor: themedStyles.primaryBackgroundColor },
                globalStyles.iconCircle
              ]}
            >
              <Ionicons
                name={'trash-outline'}
                style={[globalStyles.icon, { color: themedStyles.textColor }]}
                size={24}
              />
            </TouchableOpacity>
          )}
        </View>
      );
    }
  };

  return (
    <View
      onStartShouldSetResponder={() => true}
      onResponderRelease={event => event.stopPropagation()}
      onTouchStart={event => {
        console.log('Exercise component touched');
      }}
      style={[
        styles.exerciseContainer,
        { backgroundColor: themedStyles.secondaryBackgroundColor }
      ]}
    >
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseIndex, { color: themedStyles.textColor }]}>
          {index}
        </Text>
        <View>
          <Text
            style={[styles.exerciseName, { color: themedStyles.accentColor }]}
          >
            {exercise.name}
          </Text>
          <Text
            style={[styles.exerciseMuscle, { color: themedStyles.textColor }]}
          >
            {exercise.muscle} - {exercise.equipment}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.exerciseHeader,
          { backgroundColor: themedStyles.secondaryBackgroundColor }
        ]}
      >
        <Text style={[styles.headerText, { color: themedStyles.textColor }]}>
          Set
        </Text>
        <Text style={[styles.headerText, { color: themedStyles.textColor }]}>
          Weight
        </Text>
        <Text style={[styles.headerText, { color: themedStyles.textColor }]}>
          Reps
        </Text>
      </View>
      {exercise.sets.map((set, setIndex) => renderSetInputs(set, setIndex))}
      {mode !== 'view' && (
        <TouchableOpacity
          onPress={event => {
            event.stopPropagation();
            console.log('Button pressed');
            handleAddSet(event, exercise);
          }}
          style={[
            { backgroundColor: themedStyles.primaryBackgroundColor },
            globalStyles.iconCircle,
            styles.addSetButton
          ]}
        >
          <Ionicons
            name={'add-outline'}
            style={[globalStyles.icon, { color: themedStyles.textColor }]}
            size={24}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    marginTop: 1,
    overflow: 'hidden'
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 8
  },
  headerText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center'
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  exerciseIndex: {
    fontFamily: 'Lexend',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12
  },
  exerciseName: {
    fontFamily: 'Lexend',
    fontSize: 16
  },
  exerciseMuscle: {
    fontFamily: 'Lexend',
    fontSize: 16
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 35
  },
  setText: {
    fontFamily: 'Lexend',
    fontSize: 16,
    flex: 1,
    textAlign: 'center'
  },
  input: {
    flex: 1,
    height: 40,
    textAlign: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
    maxWidth: 80
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
    marginLeft: 10
  },
  addSetButton: {
    marginHorizontal: 70,
    marginBottom: 10
  },
  addSetButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  }
});

export default Exercise;