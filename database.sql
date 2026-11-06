CREATE DATABASE IF NOT EXISTS kr_placement_db;
USE kr_placement_db;

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  roll_no VARCHAR(30) NOT NULL UNIQUE,
  branch VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,2) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(120) NOT NULL,
  website VARCHAR(200),
  hr_email VARCHAR(100) NOT NULL UNIQUE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  job_role VARCHAR(100) NOT NULL,
  min_cgpa DECIMAL(3,2) NOT NULL,
  eligible_branch VARCHAR(150) NOT NULL DEFAULT 'All',
  package_lpa DECIMAL(6,2),
  drive_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('Pending','Shortlisted','Selected','Rejected') DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_job (student_id, job_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- Optional sample data for testing
INSERT IGNORE INTO students (name, roll_no, branch, cgpa, email) VALUES
('Ananya Reddy', 'KR001', 'CSE', 8.50, 'ananya@example.com'),
('Rahul Kumar', 'KR002', 'ECE', 7.80, 'rahul@example.com');

INSERT IGNORE INTO companies (company_name, website, hr_email) VALUES
('TechNova Solutions', 'https://example.com', 'hr@technova.example');

INSERT INTO jobs (company_id, job_role, min_cgpa, eligible_branch, package_lpa, drive_date, description)
SELECT company_id, 'Graduate Software Trainee', 7.00, 'CSE,ECE', 4.50, '2026-12-15', 'Entry-level software development role.'
FROM companies WHERE hr_email='hr@technova.example'
AND NOT EXISTS (SELECT 1 FROM jobs WHERE job_role='Graduate Software Trainee' AND company_id=companies.company_id);
