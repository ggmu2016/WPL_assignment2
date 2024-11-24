function validateForm() {
    let phone = document.forms["registrationForm"]["phone"].value;
    let password = document.forms["registrationForm"]["password"].value;
    let confirmPassword = document.forms["registrationForm"]["confirmPassword"].value;
    let dob = document.forms["registrationForm"]["dob"].value;
    let email = document.forms["registrationForm"]["email"].value;
    let male = document.forms["registrationForm"]["male"].value;
    let female = document.forms["registrationForm"]["female"].value;
    let phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    let dobPattern = /^\d{2}\/\d{2}\/\d{4}$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phonePattern.test(phone)) {
        alert("Phone number must be formatted as ddd-ddd-dddd");
        return false;
    }
    if (password.length < 8) {
        alert("Password must be at least 8 characters long");
        return false;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return false;
    }
    if (!dobPattern.test(dob)) {
        alert("Date of birth must be formatted as MM/DD/YYYY");
        return false;
    }
    if (!emailPattern.test(email) || !email.includes('.com')) {
        alert("Email must contain @ and .com");
        return false;
    }
    return true;
}

function switchToRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

function switchToLogin() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

function validateLoginForm() {
    let phone = document.forms["loginForm"]["phone"].value;
    let phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(phone)) {
        alert("Phone number must be formatted as ddd-ddd-dddd");
        return false;
    }
    return true;
}