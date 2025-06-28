// Conditional database loading based on environment
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  // Use mock database for Vercel/production
  console.log('Using mock database for Vercel deployment');
  module.exports = require('../database-mock');
} else {
  // Use real SQLite for local development
  console.log('Using SQLite database for local development');
  
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./workouts.db');

  class WorkoutModel {
    // Get all workouts for a specific date
    getWorkoutsByDate(date, callback) {
      db.all('SELECT * FROM workouts WHERE date = ? ORDER BY id', [date], callback);
    }

    // Add a new workout
    addWorkout(workoutData, callback) {
      const { date, category, exercise, muscle_focus, sets, reps, weight, duration, notes } = workoutData;
      const sql = `
        INSERT INTO workouts (date, category, exercise, muscle_focus, sets, reps, weight, duration, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [date, category, exercise, muscle_focus, sets, reps, weight, duration, notes], callback);
    }

    // Update an existing workout
    updateWorkout(workoutData, callback) {
      const { originalId, category, exercise, muscle_focus, sets, reps, weight, duration, notes } = workoutData;
      
      const sql = `
        UPDATE workouts
        SET category = ?, exercise = ?, muscle_focus = ?, sets = ?, reps = ?, weight = ?, duration = ?, notes = ?
        WHERE id = ?
      `;
      
      db.run(sql, [
        category, 
        exercise, 
        muscle_focus, 
        sets, 
        reps, 
        weight, 
        duration, 
        notes, 
        originalId
      ], callback);
    }

    // Get workout category, exercise, muscle_focus for an ID
    getWorkoutDetails(id, callback) {
      db.get('SELECT category, exercise, muscle_focus FROM workouts WHERE id = ?', [id], callback);
    }

    // Delete a workout
    deleteWorkout(id, callback) {
      db.run('DELETE FROM workouts WHERE id = ?', [id], callback);
    }

    // Filter workouts
    filterWorkouts(filterType, filterValue, callback) {
      let filterField;
      switch (filterType) {
        case 'category':
          filterField = 'category';
          break;
        case 'movement':
          filterField = 'exercise';
          break;
        case 'muscle-focus':
          filterField = 'muscle_focus';
          break;
        default:
          return callback(new Error('Invalid filter type'), null);
      }
      
      const sql = `SELECT workouts.*, 
                  (SELECT GROUP_CONCAT(w2.id) 
                   FROM workouts w2 
                   WHERE w2.date = workouts.date) as related_ids
                  FROM workouts 
                  WHERE ${filterField} = ? 
                  ORDER BY date DESC`;
      
      db.all(sql, [filterValue], callback);
    }
  }

  module.exports = new WorkoutModel();
}
