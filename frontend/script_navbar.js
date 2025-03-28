let progetti, picture, picturesArray, linkLogin, lisignup, lilogout, liavvia, licom;
let btnLogin, btnLogout, btnSignup;
const token = localStorage.getItem("jwtToken");

document.addEventListener('DOMContentLoaded', function() {

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

        console.log(getRoleFromToken(token));

        //&& getRoleFromToken(token) === "admin_creator"
        if(isUserLoggedIn()) {
            linkLogin.style.display = 'none'; 
            lisignup.style.display = 'none'; 
        } else {
            lilogout.style.display = 'none';
        }

        if(isUserLoggedIn() && (getRoleFromToken(token) === "admin_creator" || getRoleFromToken(token) === "admin")) {
            liavvia.style.display = 'none';
            licom.style.display = 'block'; 
        }

        // Ora la navbar è caricata, quindi possiamo aggiungere gli eventListener
        btnLogin = document.getElementById('login');
        btnLogout = document.getElementById('logout');
        btnSignup = document.getElementById('signup');
        

        // Verifica che gli elementi esistano prima di aggiungere gli event listener
        if (btnLogin && btnLogout && btnSignup) {
            btnLogout.addEventListener('click', logout);
            btnLogin.addEventListener('click', login);
            btnSignup.addEventListener('click', signup);
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

export function getRoleFromToken(token) {
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