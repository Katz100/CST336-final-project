const form = document.getElementById("signUpForm");

form.addEventListener("submit", function(event){
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
        event.preventDefault();
        alert(errorMessage);
    }

});