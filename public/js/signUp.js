const form = document.getElementById("signUpForm");

form.addEventListener("submit", function(event){
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dob = document.getElementById("dob").value;
    const ssn = document.getElementById("ssn").value.trim();
    const patient = document.getElementById("patient").checked;
    const doctor = document.getElementById("doctor").checked;

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
    }

    if (!patient && !doctor) {
        errorMessage += "Please select a user type.\n";
    }

    if (errorMessage !== "") {
        event.preventDefault();
        alert(errorMessage);
    }

});