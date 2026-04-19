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
    (?, ?, ?, ?, ?, ?)`;

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
    SELECT 
    u.first_name, u.last_name, d.specialty, d.practice_since
    FROM patient p
    JOIN users u ON u.id = p.doctor_id
    JOIN doctors d ON d.user_id = u.id
    WHERE p.user_id = ?`

const get_account_info_by_username = `
    SELECT *
    FROM users
    WHERE username = ?`;

const get_all_doctors = `
    SELECT d.user_id AS id, u.first_name, u.last_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
`;

//routes
app.get('/', (req, res) => {
   res.redirect('/login');
});

app.get('/signUp', async (req, res) => {
    const [doctors] = await pool.query(get_all_doctors);
    res.render('signUp', { doctors });
});

app.post('/signUp', async function(req, res) {
    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    let dob = req.body.dob;
    let ssn = req.body.ssn.replace(/\D/g, "");
    let userType = req.body.userType;
    let isDoctor = userType === "doctor" ? 1 : 0;
    let username = req.body.username;
    let password = req.body.password;
    let passwordConfirm = req.body.passwordConfirm;

    if (password !== passwordConfirm) {
        return res.send("Passwords do not match!");
    }

    let passwordHash = await bcrypt.hash(password, 10);

    try {
        const [result] = await pool.query(add_new_user, [
       username,
       passwordHash,
       firstName,
       lastName,
       ssn,
       dob,
       isDoctor
    ]);

    let userId = result.insertId;

    if (isDoctor) {
        let specialty = req.body.specialty;
        let practiceSince = req.body.practiceSince;

        if (!specialty || !practiceSince) {
            return res.send("Doctor fields are required.");
        }

        await pool.query(add_new_doctor, [
            userId,
            specialty,
            practiceSince
        ]);
    } else {
            let street = req.body.street;
            let city = req.body.city;
            let state = req.body.state;
            let zipcode = req.body.zipcode;
            let doctorId = req.body.doctorId;

            if (!street || !city || !state || !zipcode || !doctorId) {
                return res.send("Patient fields are required.");
            }

            await pool.query(add_new_patient, [
                userId,
                street,
                city,
                state,
                zipcode,
                doctorId
            ]);
    }

    res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating account.");
    }

});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null, username: "" });
});

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    const [rows] = await pool.query(get_account_info_by_username, [username]);

    if (rows.length === 0) {
    return res.render('login', { 
        error: "Invalid username or password",
        username: ""
    });
}

    let passwordHash = rows[0].password;
    let match = await bcrypt.compare(password, passwordHash);

    if (match) {
        req.session.authenticated = true;
        req.session.user = rows[0];
        if (rows[0].isDoctor) {
            res.redirect('/doctorPortal');
        } else {
            res.redirect('/patientPortal');
        }
    } else {
        return res.render('login', { 
            error: "Invalid username or password",
            username: username
        });
    }
});

app.get('/patientPortal', isAuthenticated, isPatient, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const [prescriptions] = await pool.query(
            get_patients_prescriptions,
            [userId]
        );

        const [doctorRows] = await pool.query(
            get_patients_doctor,
            [userId]
        );

        const doctor = doctorRows.length > 0 ? doctorRows[0] : null;

        res.render('patient', {
            user: req.session.user,
            prescriptions,
            doctor
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading patient portal");
    }
});

app.get('/doctorPortal', isAuthenticated, isDoctor, (req, res) => {
    let doctor_id = req.session.user.id;
    console.log("Doctor id: " + doctor_id);
    res.render('doctor');
});

app.get('/newPrescription', isAuthenticated, isDoctor, async (req, res) => {
    let doctor_id = req.session.user.id;

    const [rows] = await pool.query(get_doctors_patients, [doctor_id]);

    console.log(rows);
    res.render('newPrescription', {patients: rows});
});

app.post('/newPrescription', isAuthenticated, isDoctor, async (req, res) => {
    let doctor_id = req.session.user.id;
    let drugName = req.body.drugName;
    let refills = req.body.refills;
    let patientId = parseInt(req.body.patient_id);

    const params = [doctor_id, patientId, drugName, refills];

    await pool.query(add_new_prescription, params);

    res.redirect('/doctorPortal');
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

function isDoctor(req, res, next) {
    if (!req.session.user.isDoctor) {
        res.redirect('/patientPortal');
    } else {
        next();
    }
}

function isPatient(req, res, next) {
    if (req.session.user.isDoctor) {
        res.redirect('/doctorPortal');
    } else {
        next();
    }
}