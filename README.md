# 💪 Fitness-Tracker-Web-App


Welcome to my Fitness Tracker - your personal workout companion designed to make fitness tracking simple, informative, and enjoyable! This project combines my passion for fitness with my programming skills to create a tool that helps users stay on track with their fitness goals.

## What Can It Do?

This full-stack application helps you:
- **Log your workouts** with detailed sets, reps, weights, and notes
- **Track progress** across different muscle groups and exercises
- **Visualize your fitness journey** with an intuitive interface
- **Organize your exercise library** with customizable categories

Whether tracking your chest day progress or analyzing your back workout improvements over time, this application keeps everything organized in one place!

## Feature Showcase!

### Creating a Workout Entry:
![Creating a Workout Entry](screenshots/Create%20Entry.png)
The interface for creating a workout guides the user through a workflow designed to enter new workouts intuitively. The form includes intelligent field dependencies, whereby the muscle focus options are populated dynamically based on the selected exercise category. The system also accommodates comma-separated input for easy multi-set data entry (e.g., typing "8,8,8" for three sets of 8 reps), enhancing the user experience in logging workouts. 

### Viewing a Workout Entry:
![Viewing a Workout Entry](screenshots/View%20Entry.png)
The app presents exercise information in an organized, table-based format divided into exercise types and muscle groups. Users can access detailed workout data like sets, reps, weight, duration, and personal training notes. The interface uses a date-based navigation system to access previous workout information with a uniform styling for all workouts. 

### Editing a Workout Entry: 
![Editing a Workout Entry](screenshots/Edit%20Entry.png)
The edit function converts exercise entries into interactive forms with form validation for data consistency. With real-time form validation, the client can change every aspect of an exercise (category, movement type, muscle target, sets, repetitions, weight, duration, and notes), preventing erroneous entries (e.g., negative weights). Dynamic set modification is provided through the interface to insert or delete sets while data consistency is maintained. 

### Deleting a Workout Entry: 
![Deleting a Workout Entry](screenshots/Delete%20Entry.png)
The application employs a two-step delete process with confirmation modals to prevent accidental data loss. When the user requests deletion, the application presents a confirmation dialog explaining the action's consequences. After confirmation, the backend executes SQL DELETE queries, removing the selected workout from the database without compromising database referential integrity.

### Workout Taxonomy Management:
![Workout Taxonomy Management](screenshots/Entry%20Taxonomy.png)
Users can customize their workout taxonomy to their needs through a comprehensive category management system. The app allows adding and deleting exercise categories, movements, and muscle focus options and stores them in an organized database schema. The UI provides modals for these operations with proper validation and confirmation steps to maintain data integrity.

### Filtering System:
![Filtering System](screenshots/Filter%20Entries.png)
The filtering function enables users to analyze exercise trends along various dimensions (exercise type, muscle group, etc.). When applying a filter, the application searches the database for all the corresponding entries across dates and displays them chronologically with matches highlighted. Cross-date analysis of the sorting logic enables users to trace the trajectory of specific exercises or muscle groups over time, making data-informed training decisions. 

## Behind the Scenes
I built this application using modern web technologies and best practices:

| Component | Technologies |
|-----------|-------------|
| **Backend** | Node.js, Express.js, SQLite database |
| **Frontend** | JavaScript, Mustache templating, Bootstrap 5 |
| **Architecture** | MVC pattern with RESTful API endpoints |
| **Data Management** | Custom controllers and models ensuring data integrity |
| **User Experience** | Form validation, dynamic content loading, mobile-first responsive design |

The application provides complete CRUD functionality (Create, Read, Update, Delete) for workout entries and exercise categories, giving you full control over your fitness data.

## Why I Built This:

As someone who enjoys working out regularly, I wanted a simple yet powerful way to track my progress. Commercial apps often include features I don't need, so I created this focused solution that prioritizes what matters most - tracking your workouts effectively.
