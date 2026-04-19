const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(event) {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    let errorMessage = "";

    if (username === "") {
        errorMessage += "Username is required.\n";
    }

    if (password === "") {
        errorMessage += "Password is required.\n";
    }

    if (errorMessage !== "") {
        event.preventDefault();
        alert(errorMessage);
    }
});