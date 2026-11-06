require("dotenv").config();
const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/dashboard", async (req, res) => {
  try {
    const [[students]] = await db.query("SELECT COUNT(*) AS total FROM students");
    const [[companies]] = await db.query("SELECT COUNT(*) AS total FROM companies");
    const [[drives]] = await db.query("SELECT COUNT(*) AS total FROM jobs");
    const [[applications]] = await db.query("SELECT COUNT(*) AS total FROM applications");
    res.json({ students: students.total, companies: companies.total, drives: drives.total, applications: applications.total });
  } catch (e) { res.status(500).json({ error: "Dashboard data could not be loaded." }); }
});

app.get("/api/students", async (req, res) => {
  try { const [rows] = await db.query("SELECT * FROM students ORDER BY student_id DESC"); res.json(rows); }
  catch (e) { res.status(500).json({ error: "Unable to fetch students." }); }
});
app.post("/api/students", async (req, res) => {
  const { name, roll_no, branch, cgpa, email } = req.body;
  if (!name || !roll_no || !branch || cgpa === undefined || !email) return res.status(400).json({ error: "Please fill all student fields." });
  if (Number(cgpa) < 0 || Number(cgpa) > 10) return res.status(400).json({ error: "CGPA must be between 0 and 10." });
  try {
    const [r] = await db.query("INSERT INTO students (name, roll_no, branch, cgpa, email) VALUES (?, ?, ?, ?, ?)", [name, roll_no, branch, cgpa, email]);
    res.status(201).json({ message: "Student added successfully.", student_id: r.insertId });
  } catch (e) { res.status(400).json({ error: e.code === "ER_DUP_ENTRY" ? "Roll number or email already exists." : "Unable to add student." }); }
});
app.delete("/api/students/:id", async (req, res) => {
  try { const [r] = await db.query("DELETE FROM students WHERE student_id=?", [req.params.id]); if (!r.affectedRows) return res.status(404).json({ error: "Student not found." }); res.json({ message: "Student deleted." }); }
  catch (e) { res.status(500).json({ error: "Unable to delete student." }); }
});

app.get("/api/companies", async (req, res) => {
  try { const [rows] = await db.query("SELECT * FROM companies ORDER BY company_id DESC"); res.json(rows); }
  catch (e) { res.status(500).json({ error: "Unable to fetch companies." }); }
});
app.post("/api/companies", async (req, res) => {
  const { company_name, website, hr_email } = req.body;
  if (!company_name || !hr_email) return res.status(400).json({ error: "Company name and HR email are required." });
  try { const [r] = await db.query("INSERT INTO companies (company_name, website, hr_email) VALUES (?, ?, ?)", [company_name, website || null, hr_email]); res.status(201).json({ message: "Company registered.", company_id: r.insertId }); }
  catch (e) { res.status(400).json({ error: "Unable to register company. Check whether the HR email is already registered." }); }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT j.*, c.company_name FROM jobs j JOIN companies c ON c.company_id=j.company_id ORDER BY j.job_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: "Unable to fetch recruitment drives." }); }
});
app.post("/api/jobs", async (req, res) => {
  const { company_id, job_role, min_cgpa, eligible_branch, package_lpa, drive_date, description } = req.body;
  if (!company_id || !job_role || min_cgpa === undefined || !eligible_branch || !drive_date) return res.status(400).json({ error: "Please fill all required drive fields." });
  try {
    const [r] = await db.query(
      "INSERT INTO jobs (company_id, job_role, min_cgpa, eligible_branch, package_lpa, drive_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [company_id, job_role, min_cgpa, eligible_branch, package_lpa || null, drive_date, description || null]
    );
    res.status(201).json({ message: "Recruitment drive created.", job_id: r.insertId });
  } catch (e) { res.status(400).json({ error: "Unable to create drive. Check the company and entered values." }); }
});

app.get("/api/applications", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT a.application_id, a.status, a.applied_at, s.name AS student_name, s.roll_no,
      j.job_role, c.company_name FROM applications a JOIN students s ON s.student_id=a.student_id
      JOIN jobs j ON j.job_id=a.job_id JOIN companies c ON c.company_id=j.company_id ORDER BY a.application_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: "Unable to fetch applications." }); }
});
app.post("/api/applications", async (req, res) => {
  const { student_id, job_id } = req.body;
  if (!student_id || !job_id) return res.status(400).json({ error: "Select a student and a job." });
  try {
    const [[student]] = await db.query("SELECT * FROM students WHERE student_id=?", [student_id]);
    const [[job]] = await db.query("SELECT * FROM jobs WHERE job_id=?", [job_id]);
    if (!student || !job) return res.status(404).json({ error: "Student or recruitment drive not found." });
    const branchOK = job.eligible_branch.toLowerCase() === "all" || job.eligible_branch.toLowerCase().split(",").map(x=>x.trim()).includes(student.branch.toLowerCase());
    if (Number(student.cgpa) < Number(job.min_cgpa) || !branchOK) return res.status(400).json({ error: "This student is not eligible for the selected drive." });
    await db.query("INSERT INTO applications (student_id, job_id) VALUES (?, ?)", [student_id, job_id]);
    res.status(201).json({ message: "Application submitted successfully." });
  } catch (e) { res.status(400).json({ error: e.code === "ER_DUP_ENTRY" ? "This student has already applied for this drive." : "Unable to submit application." }); }
});
app.patch("/api/applications/:id", async (req, res) => {
  const allowed = ["Pending", "Shortlisted", "Selected", "Rejected"];
  const { status } = req.body;
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid placement status." });
  try { const [r] = await db.query("UPDATE applications SET status=? WHERE application_id=?", [status, req.params.id]); if (!r.affectedRows) return res.status(404).json({ error: "Application not found." }); res.json({ message: "Placement status updated." }); }
  catch (e) { res.status(500).json({ error: "Unable to update status." }); }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KR Placement Management System running at http://localhost:${PORT}`));
