import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProgramContext } from '../src/context/programContext';
import ProgramForm from '../components/ProgramForm';
import Workout from '../components/Workout';
import { useTheme } from '../src/hooks/useTheme';
import { getThemedStyles } from '../src/utils/themeUtils';
import { globalStyles } from '../src/styles/globalStyles';
import Header from '../components/Header';
import useExpandedWorkouts from '../src/hooks/useExpandedWorkouts';

const EditProgram = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { program: initialProgram } = route.params;
  const {
    state,
    initializeEditProgramState,
    setMode,
    updateProgram,
    addWorkout,
    setActiveWorkout,
    clearProgram
  } = useContext(ProgramContext);

  const program = state.program;
  const workouts = state.workout.workouts;
  const [isProgramFormExpanded, setIsProgramFormExpanded] = useState(true);
  const {
    expandedWorkouts,
    toggleWorkout,
    initializeExpanded,
    collapseAllWorkouts
  } = useExpandedWorkouts();

  const { state: themeState } = useTheme();
  const themedStyles = getThemedStyles(
    themeState.theme,
    themeState.accentColor
  );

  useEffect(() => {
    console.log('EditProgram useEffect - Initial state:', state);
    setMode('edit');
    if (
      !state.program ||
      !state.workout ||
      !state.workout.workouts ||
      state.workout.workouts.length === 0
    ) {
      const programToEdit = route.params.program;
      initializeEditProgramState(programToEdit, programToEdit.workouts);
    }
  }, []);

  useEffect(() => {
    console.log('State updated:', state);
  }, [state]);

  useEffect(() => {
    initializeExpanded(workouts);
  }, [workouts]);

  const handleUpdateProgram = async () => {
    try {
      const updatedProgram = {
        ...program,
        workouts: workouts.map(workout => {
          const updatedWorkout = workouts[workout.id];
          return updatedWorkout
            ? {
                ...updatedWorkout,
                exercises: updatedWorkout.exercises.map(exercise => ({
                  ...exercise,
                  sets: exercise.sets.map(set => ({
                    ...set,
                    weight: parseInt(set.weight, 10) || 0,
                    reps: parseInt(set.reps, 10) || 0,
                    order: parseInt(set.order, 10) || 0
                  }))
                }))
              }
            : workout;
        })
      };

      await updateProgram(updatedProgram);

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save the program:', error);
    }
  };

  const handleAddWorkout = event => {
    event.preventDefault();
    addWorkout(program.id);
  };

  const handleToggleProgramForm = () => {
    setIsProgramFormExpanded(prev => {
      if (!prev) {
        collapseAllWorkouts();
      }
      return !prev;
    });
  };

  const handleCancel = () => {
    clearProgram();
    navigation.goBack();
  };

  const handleExpandWorkout = useCallback(
    workoutId => {
      toggleWorkout(workoutId);
      setActiveWorkout(workoutId);
      setIsProgramFormExpanded(false);
    },
    [toggleWorkout, setActiveWorkout]
  );

  if (!state.program) {
    return (
      <SafeAreaView
        style={[
          globalStyles.container,
          { backgroundColor: themedStyles.primaryBackgroundColor }
        ]}
      >
        <Header pageName='Edit Program' />
        <Text style={{ color: themedStyles.textColor }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: themedStyles.primaryBackgroundColor }
      ]}
    >
      <Header pageName='Edit Program' />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          onPress={handleToggleProgramForm}
          style={styles.toggleButton}
        ></TouchableOpacity>

        <View style={styles.formContainer}>
          <ProgramForm
            program={program}
            isExpanded={isProgramFormExpanded}
            onToggleExpand={handleToggleProgramForm}
          />
        </View>

        <View style={styles.workoutsContainer}>
          {workouts && workouts.length > 0 ? (
            workouts.map(workout => (
              <Workout
                key={workout.id}
                workout={workout}
                isExpanded={expandedWorkouts[workout.id] || false}
                onToggleExpand={() => handleExpandWorkout(workout.id)}
              />
            ))
          ) : (
            <Text style={{ color: themedStyles.textColor }}>
              No workouts available
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: 5
  },
  formContainer: { borderRadius: 8 },
  workoutsContainer: {
    marginBottom: 10
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  saveButton: {
    flex: 1,
    marginRight: 10
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10
  }
});

export default EditProgram;