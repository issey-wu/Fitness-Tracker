// This file is used to create a connection to the SQLite database. 
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workouts.db');

module.exports = db;