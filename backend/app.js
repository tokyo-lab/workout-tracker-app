const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors());

// Import routes
const imageRoutes = require('./routes/images');
const musclesRoutes = require('./routes/muscles');
const equipmentsRoutes = require('./routes/equipment_catalog');
const exerciseCatalogRoutes = require('./routes/exercise_catalog');
const usersRoutes = require('./routes/users');
const programRoutes = require('./routes/programs');
const workoutRoutes = require('./routes/workout');
const userSetsRoutes = require('./routes/sets');
const settingsRoutes = require('./routes/settings');
const userExercisesRoutes = require('./routes/exercises');
const workoutHistoryRoutes = require('./routes/workout_history');
const activeProgramRoutes = require('./routes/active_program');
const progressRoutes = require('./routes/progress');

// Use your routes with a base path
app.use('/api', imageRoutes);
app.use('/api', musclesRoutes);
app.use('/api', equipmentsRoutes);
app.use('/api', exerciseCatalogRoutes);
app.use('/api', usersRoutes);
app.use('/api', settingsRoutes);
app.use('/api', workoutRoutes);
app.use('/api', userSetsRoutes);
app.use('/api', userExercisesRoutes);
app.use('/api', workoutHistoryRoutes);
app.use('/api', programRoutes);
app.use('/api', activeProgramRoutes);
app.use('/api', progressRoutes);

const PORT = process.env.PORT || 9025;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
