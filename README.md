# Timetable Management System

A web-based timetable management system built with React, Node.js, Express, and PostgreSQL. The system supports multiple user roles including Admin, Faculty, Student, and Timetable Coordinator.

## Features

- 🔐 User Authentication & Authorization  
- 👥 Multiple User Roles (Admin, Faculty, Student, Timetable Coordinator)  
- 📅 Timetable Generation & Management  
- 💬 Messaging System  
- 👤 User Management (CRUD operations)  
- 📱 Responsive Design  

## Prerequisites

- Node.js (v18+)  
- PostgreSQL (v16+)  
- pgAdmin 4  
- npm/yarn  

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/glitch1410/SJCEM_Time_Table_Management.git
cd SJCEM_Time_Table_Management
```

### 2. Install Dependencies
Install dependencies in the root and frontend directories:
```bash
# Root directory
npm install

# Frontend directory
cd frontend
npm install
```

### 3. Database Setup
Use the following commands to set up the PostgreSQL database (default username `postgres`):
```bash
# Create a new database
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE newdatabase;"

# Restore the database using some.dump file
pg_restore -U postgres -h localhost -p 5432 -d newdatabase -v /path/to/some.dump
```

Alternatively, you can restore the database via pgAdmin:
- Open **pgAdmin 4**.  
- Create a new database named `newdatabase`.  
- Right-click on the database, select **Restore**, and choose the `some.dump` file.  
- Click **Restore** to complete the process.

### 4. Configure Environment Variables
Create a `.env` file in the `/backend` directory with the following content:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=newdatabase
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# JWT Secret Key
SECRET_KEY=eH!1Mnv^Dz4R8Jk+X%LkQqP5hU7Nf$zB&tYpW9Kc
```

## Running the Application

### 1. Start the Backend Server
```bash
cd backend
node index.js
```
The server will start on [http://localhost:5000](http://localhost:5000).

### 2. Start the Frontend Development Server
```bash
cd frontend
npm start
```
The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## User Roles and Access

- **Admin**: User management, system administration  
- **Faculty**: View timetables, manage messages  
- **Student**: View timetables, receive notifications  
- **Timetable Coordinator**: Generate and manage timetables, send messages  

## Tech Stack

- **Frontend**: React.js  
- **Backend**: Node.js, Express  
- **Database**: PostgreSQL  
- **Authentication**: JWT  
- **Styling**: CSS, Tailwind CSS  

## Project Structure

```
├── backend/
│   ├── .env
│   ├── db.js
│   ├── index.js
│   └── generating.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── css/
│       └── pages/
├── package.json
└── some.dump
```

## Resources

- [Download `some.dump`](./some.dump)  

This README provides a comprehensive guide for setting up and running your timetable management system, including all necessary prerequisites, installation steps, and configuration details.