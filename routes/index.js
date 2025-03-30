// Initialize express router
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// Home routes
router.get('/', workoutController.getHome);

// Workout CRUD routes
router.post('/add-workout', workoutController.addWorkout);
router.post('/update-workout', workoutController.updateWorkout);
router.post('/delete-workout', workoutController.deleteWorkout);

// API routes
router.get('/api/workouts/filter', workoutController.getFilteredWorkouts);

module.exports = router;