// Controller for workout-related routes
const { body, validationResult } = require('express-validator');
const WorkoutModel = require('../models/workout');
const { splitSets } = require('../utils/helpers');

// Display home page with workouts for a specific date
exports.getHome = (req, res) => {
  const selectedDate = req.query.date;
  if (selectedDate) {
    WorkoutModel.getWorkoutsByDate(selectedDate, (err, rows) => {
      if (err) {
        console.error(err);
        return res.send('Error fetching workouts');
      }
      const splitted = splitSets(rows);
      res.render('index', { movements: splitted, selectedDate });
    });
  } else {
    // No date => no data
    res.render('index', { movements: [], selectedDate: null });
  }
};

// Add a new workout
exports.addWorkout = [
  // Validation middleware
  body('date').isISO8601(),
  body('category').notEmpty(),
  body('exercise').notEmpty(),
  body('sets').isInt({ min: 1 }),
  body('reps').notEmpty(),
  
  // Request handler
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Validation error: ' + JSON.stringify(errors.array()));
    }
    
    WorkoutModel.addWorkout(req.body, err => {
      if (err) {
        console.error(err);
        return res.send('Error adding workout');
      }
      res.redirect('/?date=' + encodeURIComponent(req.body.date));
    });
  }
];

// Update an existing workout
exports.updateWorkout = [
  // Validation middleware
  body('originalId').notEmpty(),
  body('sets').isInt({ min: 1 }),
  body('reps').notEmpty(),
  
  // Request handler
  (req, res) => {
    const { originalId, date } = req.body;
    let { category, exercise, muscle_focus } = req.body;
    
    console.log('Update workout request body:', req.body);
    
    // If category, exercise, or muscle_focus is missing, get from database
    if (!category || !exercise || !muscle_focus) {
      return WorkoutModel.getWorkoutDetails(originalId, (err, row) => {
        if (err || !row) {
          console.error('Error fetching existing workout data:', err);
          return res.send('Error updating workout: Could not retrieve current values');
        }
        
        // Use existing values if not provided in the form
        const finalCategory = category || row.category;
        const finalExercise = exercise || row.exercise;
        const finalMuscleFocus = muscle_focus || row.muscle_focus;
        
        console.log('Using values:', {
          category: finalCategory, 
          exercise: finalExercise, 
          muscle_focus: finalMuscleFocus
        });
        
        // Create updated workout data
        const workoutData = {
          originalId,
          category: finalCategory,
          exercise: finalExercise,
          muscle_focus: finalMuscleFocus,
          sets: req.body.sets,
          reps: req.body.reps,
          weight: req.body.weight,
          duration: req.body.duration,
          notes: req.body.notes
        };
        
        // Update the workout
        WorkoutModel.updateWorkout(workoutData, function(err) {
          if (err) {
            console.error('Error updating workout:', err);
            return res.send('Error updating workout: ' + err.message);
          }
          
          console.log('Update successful');
          res.redirect('/?date=' + encodeURIComponent(date));
        });
      });
    }
    
    // If we have all values, update directly
    const workoutData = {
      originalId,
      category,
      exercise,
      muscle_focus,
      sets: req.body.sets,
      reps: req.body.reps,
      weight: req.body.weight,
      duration: req.body.duration,
      notes: req.body.notes
    };
    
    WorkoutModel.updateWorkout(workoutData, function(err) {
      if (err) {
        console.error('Error updating workout:', err);
        return res.send('Error updating workout: ' + err.message);
      }
      
      console.log('Update successful');
      res.redirect('/?date=' + encodeURIComponent(date));
    });
  }
];

// Delete a workout
exports.deleteWorkout = (req, res) => {
  console.log("\n--- DELETE REQUEST START ---");
  console.log("Headers:", req.headers);
  console.log("Body (raw):", req.body);

  const originalId = req.body.originalId;
  const parsedId = parseInt(originalId, 10);
  const { date } = req.body;

  console.log("ID (original):", originalId);
  console.log("ID (parsed):", parsedId);
  console.log("Date:", date);

  WorkoutModel.deleteWorkout(parsedId, function(err) {
    if (err) {
      console.error("Error deleting workout:", err);
      return res.send('Error deleting workout');
    }

    console.log("Delete operation completed");
    console.log("--- DELETE REQUEST END ---\n");

    if (this.changes === 0) {
      return res.send(`No workout deleted. ID ${parsedId} might not exist or might be incorrect type.`);
    }
    res.redirect('/?date=' + encodeURIComponent(date));
  });
};

// Get filtered workouts
exports.getFilteredWorkouts = (req, res) => {
  const { type, value } = req.query;
  
  // Validate filter parameters
  if (!type || !value) {
    return res.status(400).json({ error: 'Missing filter parameters' });
  }
  
  WorkoutModel.filterWorkouts(type, value, (err, rows) => {
    if (err) {
      console.error('Error filtering workouts:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Group workouts by date
    const workoutsByDate = {};
    rows.forEach(row => {
      if (!workoutsByDate[row.date]) {
        workoutsByDate[row.date] = {
          date: row.date,
          workouts: [],
          relatedIds: row.related_ids ? row.related_ids.split(',') : []
        };
      }
      
      // Add this workout to the date group
      workoutsByDate[row.date].workouts.push(row);
    });
    
    // Fetch related workouts from the same date
    const promises = [];
    Object.values(workoutsByDate).forEach(dateGroup => {
      const promise = new Promise((resolve) => {
        // Get all workouts from this date
        WorkoutModel.getWorkoutsByDate(dateGroup.date, (err, dateWorkouts) => {
          if (err) {
            console.error(err);
            dateGroup.allWorkouts = [];
          } else {
            // Split sets for display
            dateGroup.allWorkouts = splitSets(dateWorkouts);
          }
          resolve();
        });
      });
      promises.push(promise);
    });
    
    // When all related workouts are fetched, return the data
    Promise.all(promises).then(() => {
      res.json({ workoutsByDate: Object.values(workoutsByDate) });
    });
  });
};