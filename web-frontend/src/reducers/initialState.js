import { v4 as uuidv4 } from 'uuid';

// Static IDs for initial state
const initialProgramId = uuidv4();
const initialWorkoutId = uuidv4();

export const initialState = {
  program: {
    user_id: 2,
    id: initialProgramId,
    name: 'Program 1',
    program_duration: 0,
    duration_unit: 'Days',
    days_per_week: 0,
    main_goal: 'Strength'
  },
  workouts: {
    [initialProgramId]: {
      id: initialWorkoutId,
      name: 'Workout 1',
      exercises: []
    }
  },
  activeWorkout: initialWorkoutId,
  selectedProgram: null
};
