const port = 4000

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

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
    let dob = document.forms["registrationForm"]["dob"].value;
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
    // let gender = document.querySelector('input[name="genders"]:checked').value;
    let gender = 1;

    sendRegistrationData(fname, lname, gender, dob, phone, email, password);
    alert("Your registration was submitted");
    return true;
}

async function validateLoginForm(form) {
    let phone = document.forms["loginForm"]["login-phone"].value;
    let phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(phone)) {
        alert("Phone number must be formatted as ddd-ddd-dddd");
        return false;
    }
    let password = document.forms["loginForm"]["login-password"].value;
    let log_result = await sendLoginData(phone, password);

    if(log_result === "success"){
        alert("Login success");
        setCookie("loginid", phone, 365);
        form.submit();
        location.reload();
        return true;
    } else{
        setCookie("loginid", "-1", 365);
        alert("Login failed");
        return false;
    }
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

    await fetch(`http://localhost:${port}/register`, {
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

    return await fetch(`http://localhost:${port}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginData)
    }).then(response => response.text()).then(data => {
        if (data === "yes") {
            return "success";
        } else {
            return "fail";
        }
    }).catch(error => console.error('Error fetching data:', error));
}

function checkRegistrationCookie() {
    let user = getCookie("loginid");
    if (user != "" && user != "-1") {
        let loginButton = document.getElementById("loginButton");
        loginButton.href = "";
        loginButton.innerText = "Logout";
        loginButton.onclick = function () {
            setCookieHome("loginid", "-1", -1);
        }
        document.getElementById("bodyContent").innerHTML = "<h2>Welcome " + user + "</h2>";
    }
    else {
    }
}

