import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkoutTemplate from '../../../components/WorkoutTemplate/WorkoutTemplate';
import Nav from '../../../components/Nav/Nav';
import './template.css';

const WorkoutTemplatePage = () => {
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:9025/api/workout-templates/2')
      .then(response => response.json())
      .then(data => {
        setWorkoutTemplates(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch workout templates:', error);
        setIsLoading(false); // Finish loading even if there was an error
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleCreateNewWorkout = () => {
    // Redirect to the create workout page
    navigate('/create-workout');
  };

  const handleEmptyWorkout = () => {
    // Redirect to the create workout page
    navigate('/create-workout');
  };

  const handleDelete = async template_id => {
    try {
      const response = await fetch(
        `http://localhost:9025/api/workout-templates/${template_id}`,
        {
          method: 'DELETE'
        }
      );
      if (response.status === 204) {
        setWorkoutTemplates(currentWorkouts =>
          currentWorkouts.filter(workout => workout.workout_id !== template_id)
        );
      }
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const handleEdit = workout => {
    navigate(`/edit-workout/${workout.workout_id}`, { state: { workout } });
  };

  return (
    <div className='page-layout'>
      <Nav />
      <h1 className='page-title'>Start Workout</h1>
      <h2 className='page-subtitle'>Quick Start</h2>
      <div id='start-empty-container'>
        <button onClick={handleEmptyWorkout}>Start an Empty Workout</button>
      </div>
      <div id='template-header-container'>
        <h2 className='section-title'>Templates</h2>
        <button onClick={handleCreateNewWorkout}>Create New Template</button>
      </div>
      <div id='workout-template-container'>
        {workoutTemplates.map(template => (
          <WorkoutTemplate
            workout_id={template.workout_id}
            key={template.workout_id}
            name={template.workout_name}
            plan_type={template.plan_type}
            day_type={template.workout_day_type}
            difficulty_level={template.difficulty_level}
            exercises={template.exercises}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutTemplatePage;