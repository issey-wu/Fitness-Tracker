// Helper functions for the app.
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
  
  module.exports = {
    splitSets
  };