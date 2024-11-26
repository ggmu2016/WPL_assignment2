let colorPicker;
const defaultColor = "#ffffff";

window.addEventListener("load", startup, false);

function startup(){
    colorPicker = document.querySelector("#colorPicker");
    colorPicker.value = defaultColor;
    colorPicker.addEventListener("change", updateBg, false); // could also be type:input for immediate change
    colorPicker.select();
}

function updateBg (event){
    const body = document.querySelector("body");
    if (body){
        body.style.backgroundColor = event.target.value;
    }

    const bgtext = document.querySelector("#bgtext");
    bgtext.textContent = event.target.value;
}

function updateSlider(){
    var slider = document.getElementById("slideRange");
    var sliderOutput = document.getElementById("fontSize");
    var bodyContent = document.getElementById("bodyContent");

    sliderOutput.textContent = slider.value;

    slider.oninput = function() {
        sliderOutput.innerHTML = slider.value;
        bodyContent.style.fontSize = slider.value + "px";
    }
}


function updateTime(){
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    document.querySelector('#datetime').textContent = currentDateTime;
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    let user = getCookie("loginid");
    if (user != "" && user != "-1") {
        let loginButton = document.getElementById("loginButton");
        loginButton.href = "";
        loginButton.innerText = "Logout";
        loginButton.onclick = function () {
            setCookieHome("loginid", "-1", -1);
        }
    }
    else {
    }
}

function setCookieHome(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
setInterval(updateTime, 1000);