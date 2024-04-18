import React, { useState, useMemo, useContext } from 'react';
import { ProgramContext } from '../../contexts/programContext';
import { useNavigate } from 'react-router-dom';
import ExerciseSearch from '../../components/SearchBar/SearchBar';
import Exercise from '../../components/Exercise/Exercise';
import ExerciseFilters from '../../components/ExerciseFilters/ExerciseFilters';
import useFetchData from '../../hooks/useFetchData';
import './select-exercises.css';

const SelectExercisesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);

  const navigate = useNavigate();

  const { addExercise } = useContext(ProgramContext);

  const {
    data: exercises,
    isLoading,
    error
  } = useFetchData('http://localhost:9025/api/exercise-catalog');

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesMuscle =
        !selectedMuscle ||
        selectedMuscle === 'All' ||
        exercise.muscle === selectedMuscle;
      const matchesEquipment =
        !selectedEquipment ||
        selectedEquipment === 'All' ||
        exercise.equipment === selectedEquipment;
      const matchesSearchTerm =
        !searchTerm ||
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMuscle && matchesEquipment && matchesSearchTerm;
    });
  }, [searchTerm, selectedMuscle, selectedEquipment, exercises]);

  const handleSearch = newValue => {
    setSearchTerm(newValue);
  };

  const handleMuscleChange = value => {
    setSelectedMuscle(value);
  };

  const handleEquipmentChange = value => {
    setSelectedEquipment(value);
  };

  if (isLoading) return <div>loading...</div>;
  if (error) return <div>Error loading exercises: {error}</div>;

  const handleAddSelectedExercises = () => {
    selectedExercises.forEach(exercise => {
      addExercise(activeWorkout, exercise);
    });
    navigate('/create-program');
  };

  return (
    <div id='exercise-container'>
      <h1 className='page-title'>Exercises</h1>
      <ExerciseSearch onChange={handleSearch} exercises={exercises} />
      <ExerciseFilters
        onMuscleChange={handleMuscleChange}
        onEquipmentChange={handleEquipmentChange}
      />
      <div className='exercise-container'>
        {filteredExercises.map(exercise => (
          <Exercise
            key={exercise.exercise_id}
            name={exercise.name}
            muscle={exercise.muscle}
            equipment={exercise.equipment}
            image={`http://localhost:9025/${exercise.file_path}`}
            isSelectable={false} // Make the exercise selectable in this context
            onClick={() => console.log('Exercise clicked:', exercise.name)}
          />
        ))}
      </div>
      <button onClick={handleAddSelectedExercises}>Add</button>
    </div>
  );
};

export default SelectExercisesPage;
