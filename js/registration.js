function switchToRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

function switchToLogin() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

function validateRegForm() {
    let phone = document.forms["registrationForm"]["phone"].value;
    let password = document.forms["registrationForm"]["password"].value;
    let confirmPassword = document.forms["registrationForm"]["confirmPassword"].value;
    let dob = document.forms["registrationForm"]["dob"].value.toLocaleDateString("hi-IN");
    let email = document.forms["registrationForm"]["email"].value;
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
        console.log(dob);
        alert("Date of birth must be formatted as MM/DD/YYYY");
        return false;
    }
    if (!emailPattern.test(email) || !email.includes('.com')) {
        alert("Email must contain @ and .com");
        return false;
    }

    let fname = document.forms["registrationForm"]["firstName"].value;
    let lname = document.forms["registrationForm"]["lastName"].value;
    let male = document.forms["registrationForm"]["male"].value;
    let female = document.forms["registrationForm"]["female"].value;
    let gender = 0;
    if (male == true) {
        gender = 1;
    } else if (female == true) {
        gender = 2;
    }

    alert("Cool");

    sendRegistrationData(fname, lname, gender, dob, phone, email, password);
    return true;
}

function validateLoginForm() {
    let phone = document.forms["loginForm"]["login-phone"].value;
    let phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(phone)) {
        alert("Phone number must be formatted as ddd-ddd-dddd");
        return false;
    }
    let password = document.forms["loginForm"]["login-password"].value;
    sendLoginData(phone, password);
    return true;
}
async function sendRegistrationData(fname, lname, gender, dob, phone, email, password) {
    var reg_data = {
        "fname": fname,
        "lname": lname,
        "gender": gender,
        "dob": dob,
        "phone": phone,
        "email": email,
        "password": password
    };

    await fetch("http://localhost:3000/register", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(reg_data)
    });
}

async function sendLoginData(phone, password) {
    var loginData = {
        "phone": phone,
        "password": password
    };

    await fetch("http://localhost:3000/login", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginData)
    });
}

