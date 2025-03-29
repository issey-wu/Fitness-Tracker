// config/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workouts.db');

module.exports = db;