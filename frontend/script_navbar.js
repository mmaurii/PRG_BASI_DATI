let token, progetti, picture, picturesArray, linkLogin, lisignup, lilogout, liavvia, licom;
let btnLogin, btnLogout, btnSignup, btnProfile, liProfile, logo;

document.addEventListener('DOMContentLoaded', function() {
    token = localStorage.getItem("jwtToken");

    // Caricamento della navbar
    fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;

        linkLogin = document.getElementById('lilogin');
        lisignup = document.getElementById('lisignup');
        lilogout = document.getElementById('lilogout');
        liavvia = document.getElementById('liavvia');
        licom = document.getElementById('licom');
        liProfile = document.getElementById('liprofile');

        console.log(getRoleFromToken());

        //&& getRoleFromToken(token) === "admin_creator"
        if(isUserLoggedIn()) {
            linkLogin.style.display = 'none'; 
            lisignup.style.display = 'none'; 
            liProfile.style.display='block';
        } else {
            lilogout.style.display = 'none';
            liProfile.style.display='none';
        }

        if(isUserLoggedIn() && (getRoleFromToken() === "admin_creator" || getRoleFromToken() === "admin")) {
            liavvia.style.display = 'none';
            licom.style.display = 'block'; 
        }

        // Ora la navbar è caricata, quindi possiamo aggiungere gli eventListener
        btnLogin = document.getElementById('login');
        btnLogout = document.getElementById('logout');
        btnSignup = document.getElementById('signup');
        btnProfile = document.getElementById('profile');
        logo = document.getElementById('logo');

        

        // Verifica che gli elementi esistano prima di aggiungere gli event listener
        if (btnLogin && btnLogout && btnSignup && btnProfile && logo) {
            logo.addEventListener('click', ()=>redirect("./index.html"));
            btnLogout.addEventListener('click', logout);
            btnLogin.addEventListener('click', login);
            btnSignup.addEventListener('click', signup);
            btnProfile.addEventListener('click', ()=>redirect("./profile.html"));
        } else {
            console.error('Uno o più elementi non sono stati trovati nel DOM.');
        }
    })
    .catch(error => console.error('Error loading the navbar:', error));
});

export function isUserLoggedIn() {
    try {
        const payloadBase64 = token.split('.')[1]; // Estrae la parte payload del JWT
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodifica da Base64 a JSON
        const currentTime = Date.now() / 1000;

        if (payloadDecoded.exp < currentTime) {
            console.log("Il token è scaduto.");
            return false;
        }

        return true;

    } catch (error) {
        //console.error("Errore nella decodifica del token:", error);
        return false;
    }
}

export function getRoleFromToken() {
    try {
        const payloadBase64 = token.split('.')[1]; // Estrae la parte payload del JWT
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodifica da Base64 a JSON
        //console.log(payloadDecoded);

        return payloadDecoded.ruolo || null;
    } catch (error) {
        //console.error("Errore nella decodifica del token:", error);
        return false;
    }
}

export function getUsernameFromToken() {
    try {
        const payloadBase64 = token.split('.')[1]; // Estrae la parte payload del JWT
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodifica da Base64 a JSON
        return payloadDecoded.username || null; // Restituisce lo username
    } catch (error) {
        //console.error("Errore nella decodifica del token:", error);
        return false;
    }
}


function login(){
    window.location.href = './login.html';
}

function logout(){
    localStorage.removeItem("jwtToken"); // Remove the token
    window.location.reload();
}

function signup(){
    logout();
    window.location.href = './signup.html';
}

function redirect(url) {
    if(url){
        window.location.href = url;
    }
}