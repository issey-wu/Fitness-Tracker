require('dotenv').config();
const express = require('express');
const mustacheExpress = require('mustache-express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const dayjs = require('dayjs');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('./workouts.db');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.engine('mustache', mustacheExpress());
app.set('views', __dirname + '/views');
app.set('view engine', 'mustache');
app.use(express.static('public'));

// Helper function to split sets into separate rows
function splitSets(rows) {
    let grouped = {};
    rows.forEach(row => {
      const setsCount = row.sets;
      const repsArr = row.reps ? row.reps.split(',') : [];
      const weightArr = row.weight ? row.weight.split(',') : [];
      const durationArr = row.duration ? row.duration.split(',') : [];

      let setRows = [];
      for (let i = 0; i < setsCount; i++) {
        setRows.push({
          setRowId: row.id + '-' + (i + 1),
          originalId: row.id,
          date: row.date,
          category: row.category,
          exercise: row.exercise,
          muscle_focus: row.muscle_focus,
          setNumber: i + 1,
          reps: repsArr[i] ? repsArr[i].trim() : '',
          weight: weightArr[i] ? weightArr[i].trim() : '',
          duration: durationArr[i] ? durationArr[i].trim() : '',
          notes: row.notes,
          last: i === setsCount - 1
        });
      }

      grouped[row.id] = {
        id: row.id,
        date: row.date,
        category: row.category,
        exercise: row.exercise,
        muscle_focus: row.muscle_focus,
        setsCount,
        setRows,
        notes: row.notes
      };
    });
    return Object.values(grouped);
}

// GET /
app.get('/', (req, res) => {
  const selectedDate = req.query.date;
  if (selectedDate) {
    db.all('SELECT * FROM workouts WHERE date = ? ORDER BY id', [selectedDate], (err, rows) => {
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
});

// POST /add-workout
app.post('/add-workout', [
  body('date').isISO8601(),
  body('category').notEmpty(),
  body('exercise').notEmpty(),
  body('sets').isInt({ min: 1 }),
  body('reps').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.send('Validation error: ' + JSON.stringify(errors.array()));
  }
  const { date, category, exercise, muscle_focus, sets, reps, weight, duration, notes } = req.body;
  const sql = `
    INSERT INTO workouts (date, category, exercise, muscle_focus, sets, reps, weight, duration, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [date, category, exercise, muscle_focus, sets, reps, weight, duration, notes], err => {
    if (err) {
      console.error(err);
      return res.send('Error adding workout');
    }
    res.redirect('/?date=' + encodeURIComponent(date));
  });
});

// POST /update-workout
app.post('/update-workout', [
    body('originalId').notEmpty(),
    body('sets').isInt({ min: 1 }),
    body('reps').notEmpty()
  ], (req, res) => {
    const { originalId, sets, reps, weight, duration, notes, date } = req.body;
    let { category, exercise, muscle_focus } = req.body;
    
    console.log('Update workout request body:', req.body);
    
    // First, get the current values from the database
    db.get('SELECT category, exercise, muscle_focus FROM workouts WHERE id = ?', [originalId], (err, row) => {
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
      
      // Now update with the values
      const sql = `
        UPDATE workouts
        SET category = ?, exercise = ?, muscle_focus = ?, sets = ?, reps = ?, weight = ?, duration = ?, notes = ?
        WHERE id = ?
      `;
      
      db.run(sql, [
        finalCategory, 
        finalExercise, 
        finalMuscleFocus, 
        sets, 
        reps, 
        weight, 
        duration, 
        notes, 
        originalId
      ], function(err) {
        if (err) {
          console.error('Error updating workout:', err);
          return res.send('Error updating workout: ' + err.message);
        }
        
        console.log('Update successful, changes:', this.changes);
        // Keep user on the same date
        res.redirect('/?date=' + encodeURIComponent(date));
      });
    });
  });

// POST /delete-workout
app.post('/delete-workout', (req, res) => {
    console.log("\n--- DELETE REQUEST START ---");
    console.log("Headers:", req.headers);
    console.log("Body (raw):", req.body);

    const originalId = req.body.originalId;
    const parsedId = parseInt(originalId, 10);
    const { date } = req.body;

    console.log("ID (original):", originalId);
    console.log("ID (parsed):", parsedId);
    console.log("Date:", date);

    db.get('SELECT * FROM workouts WHERE id = ?', [parsedId], (err, row) => {
        if (err) {
            console.error("Error checking record existence:", err);
            return res.send('Error checking if record exists');
        }

        console.log("Record found?", row ? "YES" : "NO");
        if (row) {
            console.log("Found record details:", row);
        }

        db.run('DELETE FROM workouts WHERE id = ?', [parsedId], function(err) {
            if (err) {
                console.error("Error executing delete:", err);
                return res.send('Error deleting workout');
            }

            console.log("SQLite changes reported:", this.changes);
            console.log("--- DELETE REQUEST END ---\n");

            if (this.changes === 0) {
                return res.send(`No workout deleted. ID ${parsedId} might not exist or might be incorrect type.`);
            }
            res.redirect('/?date=' + encodeURIComponent(date));
        });
    });
});

// GET /api/workouts/filter - New endpoint for filtered workouts
app.get('/api/workouts/filter', (req, res) => {
  const { type, value } = req.query;
  
  // Validate filter parameters
  if (!type || !value) {
    return res.status(400).json({ error: 'Missing filter parameters' });
  }
  
  // Convert filter type to database field name
  let filterField;
  switch (type) {
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
      return res.status(400).json({ error: 'Invalid filter type' });
  }
  
  // Query the database for workouts matching the filter
  const sql = `SELECT workouts.*, 
              (SELECT GROUP_CONCAT(w2.id) 
               FROM workouts w2 
               WHERE w2.date = workouts.date) as related_ids
              FROM workouts 
              WHERE ${filterField} = ? 
              ORDER BY date DESC`;
  
  db.all(sql, [value], (err, rows) => {
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
        db.all('SELECT * FROM workouts WHERE date = ? ORDER BY id', [dateGroup.date], (err, dateWorkouts) => {
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
});

app.post('/update-workout', [
    body('originalId').notEmpty(),
    body('sets').isInt({ min: 1 }),
    body('reps').notEmpty()
  ], (req, res) => {
    const { originalId, sets, reps, weight, duration, notes, date } = req.body;
    let { category, exercise, muscle_focus } = req.body;
    
    console.log('Update workout request body:', req.body);
    
    // Get current values if not provided
    if (!category || !exercise || !muscle_focus) {
      return db.get('SELECT category, exercise, muscle_focus FROM workouts WHERE id = ?', [originalId], (err, row) => {
        if (err || !row) {
          console.error('Error fetching existing workout data:', err);
          return res.send('Error updating workout: Could not retrieve current values');
        }
        
        // Use existing values if not provided in the form
        category = category || row.category;
        exercise = exercise || row.exercise;
        muscle_focus = muscle_focus || row.muscle_focus;
        
        // Now update with the values
        updateWorkout(res, originalId, category, exercise, muscle_focus, sets, reps, weight, duration, notes, date);
      });
    }
    
    // If we have all values, update directly
    updateWorkout(res, originalId, category, exercise, muscle_focus, sets, reps, weight, duration, notes, date);
  });

// Helper function to perform the actual update
function updateWorkout(res, originalId, category, exercise, muscle_focus, sets, reps, weight, duration, notes, date) {
  console.log('Updating with values:', {
    category, exercise, muscle_focus, sets, reps, weight, duration, notes
  });
  
  const sql = `
    UPDATE workouts
    SET category = ?, exercise = ?, muscle_focus = ?, sets = ?, reps = ?, weight = ?, duration = ?, notes = ?
    WHERE id = ?
  `;
  
  db.run(sql, [category, exercise, muscle_focus, sets, reps, weight, duration, notes, originalId], function(err) {
    if (err) {
      console.error('Error updating workout:', err);
      return res.send('Error updating workout: ' + err.message);
    }
    
    console.log('Update successful, changes:', this.changes);
    // Keep user on the same date
    res.redirect('/?date=' + encodeURIComponent(date));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});