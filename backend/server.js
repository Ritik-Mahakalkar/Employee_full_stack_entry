require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Create `employees` Table if Not Exists
db.query(
  `CREATE TABLE IF NOT EXISTS employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) console.error("Error creating table: ", err);
    else console.log("Employee table is ready.");
  }
);

//  API Endpoints

// **Add Employee** (POST /employees)
app.post("/employees", (req, res) => {
  const {
    name, dob, gender, address, city, state,
    email, phone, department, position, salary
  } = req.body;

  if (!name || !dob || !gender || !email || !phone || !position || !salary) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const sql = `INSERT INTO employees 
    (name, dob, gender, address, city, state, email, phone, department, position, salary) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [name, dob, gender, address, city, state, email, phone, department, position, salary],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Employee added successfully!", id: result.insertId });
    }
  );
});

// **Fetch All Employees** (GET /employees)
app.get("/employees", (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//  **Update Employee** (PUT /employees/:id)
app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const {
    name, dob, gender, address, city, state,
    email, phone, department, position, salary
  } = req.body;

  const sql = `UPDATE employees 
    SET name=?, dob=?, gender=?, address=?, city=?, state=?, email=?, phone=?, 
    department=?, position=?, salary=? WHERE employee_id=?`;

  db.query(
    sql,
    [name, dob, gender, address, city, state, email, phone, department, position, salary, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Employee not found." });
      res.json({ message: "Employee updated successfully!" });
    }
  );
});
// **Fetch Single Employee by ID** (GET /employees/:id)
app.get("/employees/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM employees WHERE employee_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Employee not found." });

    res.json(results[0]);
  });
});

//  **Delete Employee** (DELETE /employees/:id)
app.delete("/employees/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM employees WHERE employee_id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Employee deleted successfully!" });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
