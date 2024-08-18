import React, { useContext, useState, useEffect, useMemo } from 'react';
import { TbPencil } from 'react-icons/tb';
import { BsChevronCompactUp, BsChevronCompactDown } from 'react-icons/bs';
import { IoCloseCircleSharp, IoCheckmarkCircleSharp } from 'react-icons/io5';
import { MdDragHandle, MdAddBox } from 'react-icons/md';
import { RiDeleteBack2Fill } from 'react-icons/ri';
import { GrClose } from 'react-icons/gr';
import { TbHttpDelete } from 'react-icons/tb';
import TextInput from '../Inputs/TextInput';
import { ProgramContext } from '../../contexts/programContext';
import { useTheme } from '../../contexts/themeContext';
import { useNavigate } from 'react-router-dom';
import exerciseUtils from '../../utils/exercise';
import './Workout.css';

const Workout = ({
  workout: initialWorkout,
  isEditing,
  isExpanded,
  onToggleExpand
}) => {
  const {
    state,
    deleteWorkout,
    removeExercise,
    updateWorkout,
    updateWorkoutAndProgram,
    addSet,
    activeWorkout,
    setActiveWorkout,
    removeSet
  } = useContext(ProgramContext);

  // Get the most up-to-date workout data from the state
  const workout = useMemo(() => {
    const stateWorkout = state.workouts[initialWorkout.id];
    console.log('Workout from state:', stateWorkout);
    console.log('Initial workout:', initialWorkout);
    return stateWorkout || initialWorkout;
  }, [state.workouts, initialWorkout]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState(workout.name);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (workout) {
      setWorkoutTitle(workout.name);
    }
  }, [workout]);

  const handleEditTitleChange = e => {
    setIsEditingTitle(true);
    setWorkoutTitle(e.target.value);
  };

  const handleSaveTitle = () => {
    if (workout) {
      const updatedWorkout = { ...workout, name: workoutTitle };
      updateWorkoutAndProgram(updatedWorkout);
    }
    setIsEditingTitle(false);
  };

  const handleDeleteWorkout = workoutId => {
    deleteWorkout(workoutId);
    if (activeWorkout === workoutId) {
      setActiveWorkout(null);
    }
  };

  const handleRemoveExercise = (workoutId, exerciseId) => {
    console.log('Removing exercise:', exerciseId);
    console.log('From workout:', workoutId);
    removeExercise(workoutId, exerciseId);
  };

  const handleWorkoutExpand = () => {
    onToggleExpand(workout.id);
    if (activeWorkout !== workout.id) {
      setActiveWorkout(workout.id);
    }
  };

  const handleAddSet = exercise => {
    const exerciseId = exerciseUtils.getExerciseId(exercise);
    console.log('Adding set for workout:', workout);
    if (!workout || !workout.id) {
      console.error('No active workout found.');
      return;
    }

    console.log('handleAddSet called with exerciseId:', exerciseId);
    console.log('handleAddSet called with workoutId:', workout.id);

    addSet(workout.id, exerciseId);
  };

  const handleAddExercises = workoutId => {
    setActiveWorkout(workoutId);

    let selectedExercises = [];

    if (isEditing) {
      selectedExercises = workout.exercises || [];
    } else {
      selectedExercises = state.workouts[workoutId]?.exercises || [];
    }

    navigate('/select-exercises', {
      state: { workoutId, selectedExercises, isEditing }
    });
  };

  const handleChange = (updatedValue, exercise, set) => {
    const updatedSet = { ...set, ...updatedValue };
    console.log('Updating set:', updatedSet);

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map(ex =>
        ex.id === exercise.id
          ? {
              ...ex,
              sets: ex.sets.map(s => (s.id === set.id ? updatedSet : s))
            }
          : ex
      )
    };
    console.log('Updating workout:', updatedWorkout);
    updateWorkout(updatedWorkout);
  };

  const handleRemoveSet = (workoutId, exerciseId, setId) => {
    if (isEditing) {
      const updatedWorkout = {
        ...workout,
        exercises: workout.exercises.map(ex =>
          exerciseUtils.getExerciseId(ex) === exerciseId
            ? {
                ...ex,
                sets: ex.sets.filter(s => s.id !== setId)
              }
            : ex
        )
      };
      updateWorkout(updatedWorkout);
    } else {
      removeSet(workoutId, exerciseId, setId);
    }
  };

  const workoutExercises = useMemo(() => {
    if (isEditing && workout.exercises) {
      return workout.exercises;
    } else if (state.workouts && state.workouts[workout.id]) {
      return state.workouts[workout.id].exercises;
    }
    return workout.exercises || [];
  }, [isEditing, workout, state.workouts]);

  const exerciseText = count => {
    if (count === 0) return 'No Exercises';
    if (count === 1) return '1 Exercise';
    return `${count} Exercises`;
  };

  const exerciseCount = workoutExercises.length;

  return (
    <div
      className={`workout ${theme} ${
        activeWorkout === workout.id ? 'active' : ''
      }`}
    >
      <div className='workout__header'>
        <button className='workout__expand-btn' onClick={handleWorkoutExpand}>
          {isExpanded ? (
            <BsChevronCompactUp
              className={`workout__icon ${theme}`}
              size={30}
            />
          ) : (
            <BsChevronCompactDown
              className={`workout__icon ${theme}`}
              size={30}
            />
          )}
        </button>
        <div className='workout__title-container'>
          {isEditingTitle ? (
            <div>
              <input
                className={`workout__title-input ${theme}`}
                type='text'
                value={workoutTitle}
                onChange={handleEditTitleChange}
                placeholder='Enter Workout Title'
              />
              <IoCheckmarkCircleSharp
                className={`workout__icon ${theme}`}
                onClick={handleSaveTitle}
                size={25}
              />
              <IoCloseCircleSharp
                className={`workout__icon ${theme}`}
                onClick={() => setIsEditingTitle(false)}
                size={25}
              />
            </div>
          ) : (
            <h2 className={`workout__title ${theme}`}>{workoutTitle}</h2>
          )}
          {isExpanded && !isEditingTitle && (
            <TbPencil
              className={`workout__icon pencil-icon ${theme}`}
              onClick={() => setIsEditingTitle(true)}
              size={25}
            />
          )}
          <button
            className='workout__delete-btn'
            onClick={() => handleDeleteWorkout(workout.id)}
          >
            <GrClose className={`workout__icon ${theme}`} size={20} />
          </button>
        </div>
      </div>
      <div className='workout__subtitle'>
        <span className={`workout__exercise-count ${theme}`}>
          {exerciseText(exerciseCount)}
        </span>
        <button
          onClick={() => handleAddExercises(workout.id)}
          className='workout__add-exercise-btn'
        >
          Add
        </button>
      </div>
      {isExpanded && (
        <div className='workout__exercises'>
          <div className='workout__exercises-header-container'>
            <h4 className={`workout__exercises_header ${theme}`}>Exercise</h4>
            <h4 className={`workout__exercises_header ${theme}`}>Set</h4>
            <h4 className={`workout__exercises_header ${theme}`}>Weight</h4>
            <h4 className={`workout__exercises_header ${theme}`}>Reps</h4>
          </div>
          {workoutExercises.length > 0 ? (
            workoutExercises.map(exercise => (
              <div
                key={exerciseUtils.getExerciseId(exercise)}
                className='workout__each-exercise'
              >
                <div className='workout__exercise-column'>
                  <div className='workout__exercise-info'>
                    <div className={`workout__drag-order-container ${theme}`}>
                      <span
                        className={`workout__exercise-order-number ${theme}`}
                      >
                        {exercise.order}
                      </span>
                    </div>
                    <div className='workout__exercise-details'>
                      <h4 className={`workout__exercises_name ${theme}`}>
                        {exercise.name}
                      </h4>
                      <h5 className={`workout__exercise-muscle ${theme}`}>
                        {exercise.muscle}
                      </h5>
                    </div>
                  </div>
                </div>
                <div className='workout__sets-column'>
                  {exercise.sets &&
                    exercise.sets.length > 0 &&
                    exercise.sets.map(set => (
                      <div key={set.id} className='workout__set'>
                        <p className={`workout__set-order-number ${theme}`}>
                          {set.order}
                        </p>
                      </div>
                    ))}
                  <button
                    onClick={() => handleAddSet(exercise)}
                    className='workout__add-set-btn'
                  >
                    <MdAddBox size={25} />
                  </button>
                </div>

                <div className='workout__weights-column'>
                  {exercise.sets && exercise.sets.length > 0
                    ? exercise.sets.map(set => (
                        <div key={set.id} className='workout__set'>
                          <TextInput
                            className={`workout__set-weight ${theme}`}
                            id='set-weight'
                            onChange={e =>
                              handleChange(
                                { weight: e.target.value },
                                exercise,
                                set
                              )
                            }
                            value={set.weight}
                            type='number'
                          />
                        </div>
                      ))
                    : null}
                  <div className='workout__blank'></div>
                </div>

                <div className='workout__reps-column'>
                  {exercise?.sets?.map(set => (
                    <div key={set.id} className='workout__set'>
                      <TextInput
                        className={`workout__set-reps ${theme}`}
                        onChange={e =>
                          handleChange({ reps: e.target.value }, exercise, set)
                        }
                        value={set.reps}
                        type='number'
                      />
                    </div>
                  ))}
                  <div className='workout__blank'></div>
                </div>
                <div className='workout__delete-set-column'>
                  {exercise?.sets?.map((set, setIndex) => (
                    <div key={set.id} className='workout__set'>
                      {setIndex > 0 ? (
                        <button
                          onClick={() =>
                            handleRemoveSet(
                              workout.id,
                              exerciseUtils.getExerciseId(exercise),
                              set.id
                            )
                          }
                          className='workout__delete-set-btn'
                        >
                          <RiDeleteBack2Fill size={25} />
                        </button>
                      ) : (
                        <div className='workout__set'>
                          <div className='workout__no-delete-set-btn' />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className='workout__blank'></div>
                </div>

                <div className='workout__exercise-controls'>
                  <div className={`workout__drag-handle ${theme}`}>
                    <MdDragHandle size={25} />
                  </div>
                  <button
                    className='workout__remove-exercise-btn'
                    onClick={() =>
                      handleRemoveExercise(
                        workout.id,
                        exerciseUtils.getExerciseId(exercise)
                      )
                    }
                  >
                    <TbHttpDelete size={30} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className='workout__no-exercise-message'>No exercises added</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Workout;
