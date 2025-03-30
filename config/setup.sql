DROP TABLE IF EXISTS workouts;

CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  exercise TEXT NOT NULL,
  muscle_focus TEXT,
  sets INTEGER,
  reps TEXT,
  weight TEXT,
  duration TEXT,
  notes TEXT
);

-- For 03/10/2025, "Back" day with 3 sets for each movement (existing record)
INSERT INTO workouts (date, category, exercise, muscle_focus, sets, reps, weight, duration, notes)
VALUES
('2025-03-10', 'Back', 'Lat Pullover', 'Side Back Focused', 3, '6,7,8', '57.5,52.5,47.5', '30,30,30', 'Work on keeping feet planted'),
('2025-03-10', 'Back', 'One Arm Row', 'Upper-Mid Back Focused', 3, '6,7,8', '145,130,115', '30,30,30', 'Slow the eccentric and explode on the concentric'),
('2025-03-10', 'Back', 'Close-Grip Lat Pulldown', 'Lower Back Focused', 3, '6,7,8', '130,115,100', '30,30,30', 'Squeeze at the bottom for 2 seconds');