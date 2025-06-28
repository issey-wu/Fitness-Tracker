// Mock database for Vercel deployment
class MockWorkoutModel {
  constructor() {
    this.mockWorkouts = [
      {
        id: 1,
        date: '2025-03-10',
        category: 'Back',
        exercise: 'Lat Pullover',
        muscle_focus: 'Lower Back',
        sets: 3,
        reps: '6,7,8',
        weight: '57.5,52.5,47.5',
        duration: '30,30,30',
        notes: 'Demo workout - works on Vercel!'
      },
      {
        id: 2,
        date: '2025-03-10',
        category: 'Back',
        exercise: 'Single Arm Rows',
        muscle_focus: 'Mid Back',
        sets: 3,
        reps: '6,7,8',
        weight: '145,130,115',
        duration: '30,30,30',
        notes: 'Another demo workout'
      },
      {
        id: 3,
        date: '2025-03-11',
        category: 'Chest',
        exercise: 'Bench Press',
        muscle_focus: 'Mid Chest',
        sets: 3,
        reps: '8,6,4',
        weight: '135,155,175',
        duration: '',
        notes: 'Progressive overload'
      }
    ];
    this.nextId = 4;
  }

  getWorkoutsByDate(date, callback) {
    console.log('Mock: Getting workouts for date:', date);
    const workouts = this.mockWorkouts.filter(w => w.date === date);
    setTimeout(() => callback(null, workouts), 50);
  }

  addWorkout(workoutData, callback) {
    console.log('Mock: Adding workout:', workoutData);
    const newWorkout = {
      id: this.nextId++,
      ...workoutData
    };
    this.mockWorkouts.push(newWorkout);
    setTimeout(() => callback(null), 50);
  }

  updateWorkout(workoutData, callback) {
    console.log('Mock: Updating workout:', workoutData);
    const index = this.mockWorkouts.findIndex(w => w.id == workoutData.originalId);
    if (index !== -1) {
      this.mockWorkouts[index] = { ...this.mockWorkouts[index], ...workoutData };
    }
    setTimeout(() => callback(null), 50);
  }

  deleteWorkout(id, callback) {
    console.log('Mock: Deleting workout:', id);
    const index = this.mockWorkouts.findIndex(w => w.id == id);
    if (index !== -1) {
      this.mockWorkouts.splice(index, 1);
    }
    setTimeout(() => {
      callback.call({ changes: 1 });
    }, 50);
  }

  getWorkoutDetails(id, callback) {
    console.log('Mock: Getting workout details for:', id);
    const workout = this.mockWorkouts.find(w => w.id == id);
    setTimeout(() => callback(null, workout), 50);
  }

  filterWorkouts(filterType, filterValue, callback) {
    console.log('Mock: Filtering workouts:', filterType, filterValue);
    let filteredWorkouts = [];
    
    switch (filterType) {
      case 'category':
        filteredWorkouts = this.mockWorkouts.filter(w => w.category === filterValue);
        break;
      case 'movement':
        filteredWorkouts = this.mockWorkouts.filter(w => w.exercise === filterValue);
        break;
      case 'muscle-focus':
        filteredWorkouts = this.mockWorkouts.filter(w => w.muscle_focus === filterValue);
        break;
    }
    
    setTimeout(() => callback(null, filteredWorkouts), 50);
  }
}

module.exports = new MockWorkoutModel();
