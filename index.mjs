import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from "express-session"

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

app.set('trust proxy', 1); 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


//setting up database connection pool
const pool = mysql.createPool({
    host: "bbj31ma8tye2kagi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "ofrrz451lt9y96o4",
    password: "v71ailar76wlh8dm",
    database: "it7vsj6f4a94t599",
    connectionLimit: 10,
    waitForConnections: true
});

// query strings
const add_new_user = 
    `INSERT INTO users (username, password, first_name, last_name, ssn, birthdate, isDoctor)
     VALUES
     (?, ?, ?, ?, ?, ?, ?)`;

const add_new_doctor = `
    INSERT INTO doctors (user_id, specialty, practice_since)
    VALUES
    (?, ?, ?)`;

const add_new_patient = `
    INSERT INTO patient (user_id, street, city, state, zipcode, doctor_id)
    VALUES
    (?, ?, ?, ?, ?)`;

const add_new_prescription = `
    INSERT INTO prescription (doctor_id, patient_id, drug_name, refills)
    VALUES
    (?, ?, ?, ?)`;


const is_user_a_doctor = 
    `SELECT isDoctor
     FROM users
     WHERE id = ?
    `;

const get_patients_prescriptions = `
    SELECT p.id, d.first_name AS doctor, p.drug_name, p.refills
    FROM prescription p
    JOIN users d on p.doctor_id = d.id
    WHERE patient_id = ?`;

const get_doctors_prescriptions = `
    SELECT p.id, u.first_name AS patient, p.drug_name, p.refills
    FROM prescription p
    JOIN users u ON p.patient_id = u.id
    WHERE p.doctor_id = ?`;

const get_doctors_patients = `
    SELECT p.user_id, u.first_name AS patient_first_name, u.last_name AS patient_last_name
    FROM patient p
    JOIN users u ON u.id = p.user_id
    WHERE doctor_id = ?`;

const get_patients_doctor = `
    SELECT d.id, d.first_name, d.last_name
    FROM patient p
    JOIN users d on d.id = p.doctor_id
    WHERE p.user_id = ?`

const get_account_info_by_username = `
    SELECT *
    FROM users
    WHERE username = ?`;

//routes
app.get('/', (req, res) => {
   res.render('login')
});

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let passwordHash = "";

    const [rows] = await pool.query(get_account_info_by_username, [username]);

    if (rows.length > 0) {
        passwordHash = rows[0].password;
    }

    let match = await bcrypt.compare(password, passwordHash);

    console.log(rows[0]);
    if (match) {
        req.session.authenticated = true;
        if (rows[0].isDoctor) {
            req.session.user = {
                id: rows[0].id,
                username: rows[0].username,
                isDoctor: rows[0].isDoctor
            };
            res.redirect('/doctorPortal');
        } else {
            req.session.user = {
                id: rows[0].id,
                username: rows[0].username,
                isDoctor: rows[0].isDoctor
            };
            res.redirect('/patientPortal');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/patientPortal', isAuthenticated, (req, res) => {
    res.render('patient');
});

app.get('/doctorPortal', isAuthenticated, (req, res) => {
    let doctor_id = req.session.user.id;
    console.log("Doctor id: " + doctor_id);
    res.render('doctor');
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})

function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/');
    } else {
        next();
    }
}