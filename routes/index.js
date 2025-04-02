// Initialize express router
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// Home route -View Workout
router.get('/', workoutController.getHome);

// Workout CRUD routes

// Add a new workout
router.post('/add-workout', workoutController.addWorkout);
// Update an existing workout
router.post('/update-workout', workoutController.updateWorkout);
// Delete a workout
router.post('/delete-workout', workoutController.deleteWorkout);

// API routes
router.get('/api/workouts/filter', workoutController.getFilteredWorkouts);

module.exports = router;