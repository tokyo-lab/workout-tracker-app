import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../../components/SearchBar/SearchBar';
import Exercise from '../../../components/Exercise/Exercise';
import ExerciseFilters from '../../../components/ExerciseFilters/ExerciseFilters';
import useFetchData from '../../../hooks/useFetchData';
import './template.css';

const EditTemplatePage = ({ workoutData }) => {
  const [templateName, setTemplateName] = useState(
    workoutData.workout_name || ''
  );
  const [planType, setPlanType] = useState(workoutData.plan_type || '');
  const [durationUnit, setDurationUnit] = useState('');
  const [difficulty, setDifficulty] = useState(
    workoutData.difficulty_level || ''
  );
  const [selectedExercises, setSelectedExercises] = useState(
    new Set(workoutData.exercises || [])
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');

  const navigate = useNavigate();

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

  const handleSearch = value => {
    setSearchTerm(value);
  };

  const handleMuscleChange = value => {
    setSelectedMuscle(value);
  };

  const handleEquipmentChange = value => {
    setSelectedEquipment(value);
  };

  const handlePlanTypeChange = selectedPlanType => {
    setPlanType(selectedPlanType);
  };

  const handleDayTypeChange = selectedDurationUnit => {
    setDurationUnit(selectedDurationUnit);
  };

  const handleDifficultyChange = selectedDifficulty => {
    setDifficulty(selectedDifficulty);
  };

  const handleSaveTemplate = async event => {
    event.preventDefault();

    const templateData = {
      workout_name: templateName,
      duration_unit: durationUnit,
      plan_type: planType,
      difficulty_level: difficulty,
      exercises: Array.from(selectedExercises)
    };

    try {
      const response = await fetch(
        `http://localhost:9025/api/workout-templates/${workoutData.workout_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        }
      );

      if (!response.ok) {
        throw new Error('Something went wrong updating the template');
      }
      navigate('/workouts');
    } catch (error) {
      console.error('Failed to update the template:', error);
    }
  };

  const handleCancel = () => {
    // Redirect to the create workout page
    navigate('/workouts');
  };

  const handleSelectExercise = exerciseId => {
    setSelectedExercises(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(exerciseId)) {
        newSelected.delete(exerciseId); //remove the exercise if it's already selected
      } else {
        newSelected.add(exerciseId);
      }
      return newSelected;
    });
  };

  if (isLoading) return <div>loading...</div>;
  if (error) return <div>Error loading exercises: {error}</div>;

  const dayTypes = ['Day of Week', 'Numerical'];
  const planTypes = ['General', 'Bulking', 'Cutting', 'Sport'];
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advance'];

  return (
    <div className='page-layout'>
      <h1 className='page-title'>Edit Template</h1>
      <form onSubmit={handleSaveTemplate}>
        <div>
          <div class='input-container'>
            <input
              type='text'
              class='full-width-input'
              placeholder='Enter Workname Name'
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
            />
          </div>

          <div className='template-detail-container'>
            <div className='template-detail'>
              <select
                id='day-type'
                onSelect={handleDayTypeChange}
                placeholder='Select Day Type'
              >
                <option value=''>Select Day Type</option>
                {dayTypes.map((option, index) => (
                  <option key={index} value={option.name}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className='template-detail'>
              <select
                id='plan-type'
                onChange={event => handlePlanTypeChange(event.target.value)}
                placeholder='Select Plan Type'
              >
                <option value=''>Select Plan Type</option>
                {planTypes.map((option, index) => (
                  <option key={index} value={option.name}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className='template-detail'>
              <select
                id='difficulty-level'
                onChange={event => handleDifficultyChange(event.target.value)}
              >
                <option value=''>Select Difficulty Level</option>
                {difficultyLevels.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <SearchBar onChange={handleSearch} />
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
              isSelectable={true} // Make the exercise selectable in this context
              isSelected={selectedExercises.has(exercise.exercise_id)}
              onClick={() => handleSelectExercise(exercise.exercise_id)}
            />
          ))}
        </div>
        <div className='button-container'>
          <button id='save-template-button' onClick={handleSaveTemplate}>
            Save Template
          </button>
          <button id='cancel-template-button' onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTemplatePage;
