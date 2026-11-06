# KR College Placement Management System

A mini project built with **HTML, CSS, JavaScript, Node.js, Express and MySQL**.

## Main modules
1. Student management – add, view and delete student records.
2. Company registration – administrator can register recruiting companies.
3. Recruitment drives – create drives with job role, minimum CGPA, eligible branches, package and date.
4. Student applications – submit applications for eligible drives.
5. Placement tracking – update application status to Pending, Shortlisted, Selected or Rejected.
6. Dashboard – summary counts for students, companies, drives and applications.

## Requirements
- Node.js (LTS)
- MySQL Server and MySQL Workbench
- VS Code

## Setup

### 1. Create the database
1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `database.sql` from this project.
3. Click the lightning icon to execute the complete SQL script.
4. The script creates `kr_placement_db` and its tables, and inserts optional demo records.

### 2. Configure database connection
1. In the project root, make a copy of `.env.example`.
2. Rename the copy to `.env`.
3. Put your MySQL password in `DB_PASSWORD`. If your MySQL root account has no password, leave it empty.
4. Keep `DB_NAME=kr_placement_db`.

Example:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=kr_placement_db
PORT=3000
```

### 3. Install packages
Open the VS Code terminal in the project folder and run:
```
npm install
```

### 4. Start the project
```
npm start
```
Open this address in Chrome:
```
http://localhost:3000
```
Keep the terminal running while using the website. Press `Ctrl + C` to stop the server.

## Important notes
- This is an academic demonstration mini project, not a production-ready system.
- Admin authentication, student login, password security and deployment configuration are not included.
- CGPA must be between 0 and 10.
- In `eligible_branch`, enter `All` or comma-separated branches such as `CSE,ECE`.
- Duplicate roll numbers, emails and duplicate student applications are prevented by database constraints.

## Project structure
```
KR_College_Placement_Management_System/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── database.sql
├── db.js
├── server.js
├── package.json
├── .env.example
└── README.md
```
