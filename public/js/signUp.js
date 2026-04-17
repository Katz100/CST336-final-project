const form = document.getElementById("signUpForm");

const patientRadio = document.getElementById("patient");
const doctorRadio = document.getElementById("doctor");
const patientFields = document.getElementById("patientFields");
const doctorFields = document.getElementById("doctorFields");

function toggleUserFields() {
    if (doctorRadio.checked) {
        doctorFields.style.display = "block";
        patientFields.style.display = "none";
    } else if (patientRadio.checked) {
        patientFields.style.display = "block";
        doctorFields.style.display = "none";
    } else {
        patientFields.style.display = "none";
        doctorFields.style.display = "none";
    }
}

patientRadio.addEventListener("change", toggleUserFields);
doctorRadio.addEventListener("change", toggleUserFields);
form.addEventListener("submit", async function(event){
    event.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dob = document.getElementById("dob").value;
    const ssn = document.getElementById("ssn").value.trim();
    const patient = document.getElementById("patient").checked;
    const doctor = document.getElementById("doctor").checked;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    let errorMessage = "";

    if (firstName === "") {
        errorMessage += "First Name is required.\n";
    }

    if (lastName === "") {
        errorMessage += "Last Name is required.\n";
    }

    if (dob === "") {
        errorMessage += "Date of Birth is required.\n";
    }

    if (ssn === "") {
        errorMessage += "Social Security Number is required.\n";
    } else {
        const cleanSSN = ssn.replace(/\D/g,"");
        if (cleanSSN.length !== 9) {
            errorMessage += "Social Security Number MUST be 9 digits.\n";
        }
    }

    if (!patient && !doctor) {
        errorMessage += "Please select a user type.\n";
    }

    if (doctor) {
        const specialty = document.getElementById("specialty").value.trim();
        const practiceSince = document.getElementById("practiceSince").value;

        if (specialty === "") {
            errorMessage += "Specialty is required for doctors.\n";
        }

        if (practiceSince === "") {
            errorMessage += "Practice Since year is required for doctors.\n";
        }
    }

    if (patient) {
        const street = document.getElementById("street").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const zipcode = document.getElementById("zipcode").value.trim();
        const doctorId = document.getElementById("doctorId").value;
        const url = `https://api.zippopotam.us/us/${zipcode}`;
        let response = await fetch(url);
        let data = await response.json();

        if (street === "") {
            errorMessage += "Street is required for patients.\n";
        }

        if (city === "") {
            errorMessage += "City is required for patients.\n";
        }

        if (state === "") {
            errorMessage += "State is required for patients.\n";
        }

        if (zipcode === "" || Object.keys(data).length === 0) {
            errorMessage += "Zipcode is blank or invalid.\n";
        }

        if (doctorId === "") {
            errorMessage += "Please select a doctor.\n";
        }
    }

    if (username === "") {
        errorMessage += "Username is required.\n";
    }

    if (password === "") {
        errorMessage += "Password is required.\n";
    }

    if (passwordConfirm === "") {
        errorMessage += "Please confirm your password.\n";
    }

    if (password !== passwordConfirm) {
        errorMessage += "Passwords do not match.\n";   
    }

    if (errorMessage !== "") {
        alert(errorMessage);
        return;
    }

    form.submit();
});
