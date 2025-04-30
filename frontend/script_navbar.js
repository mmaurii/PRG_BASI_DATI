let token, progetti, picture, picturesArray, linkLogin, lisignup, lilogout, liavvia, licom;
let btnLogin, btnLogout, btnSignup, btnProfile, liProfile, logo, avviaProgetto, competenze;

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

        if(isUserLoggedIn()) {
            linkLogin.style.display = 'none'; 
            lisignup.style.display = 'none'; 
            liProfile.style.display='block';
        } else {
            lilogout.style.display = 'none';
            liProfile.style.display='none';
        }

        if(isUserLoggedIn() && (getRoleFromToken() === "admin")) {
            liavvia.style.display = 'none';
            licom.style.display = 'block';
        }

        if(getRoleFromToken() === "user") {
            liavvia.style.display = 'none';
        }

        // Ora la navbar è caricata, quindi possiamo aggiungere gli eventListener
        btnLogin = document.getElementById('login');
        btnLogout = document.getElementById('logout');
        btnSignup = document.getElementById('signup');
        btnProfile = document.getElementById('profile');
        logo = document.getElementById('logo');
        avviaProgetto = document.getElementById('avviaProgetto');
        competenze = document.getElementById('competenze');;

        // Verifica che gli elementi esistano prima di aggiungere gli event listener
        if (btnLogin && btnLogout && btnSignup && btnProfile && logo && avviaProgetto && competenze) {
            logo.addEventListener('click', ()=>redirect("./index.html"));
            btnLogout.addEventListener('click', logout);
            btnLogin.addEventListener('click', login);
            btnSignup.addEventListener('click', signup);
            btnProfile.addEventListener('click', ()=>redirect("./profile.html"));
            competenze.addEventListener('click', ()=>redirect("./competenze.html"));

            if (isUserLoggedIn()) {
                avviaProgetto.addEventListener('click', ()=>redirect("./addProgetto.html"));
            }else{
                avviaProgetto.addEventListener('click', login);
            }
        } else {
            console.error('Uno o più elementi non sono stati trovati nel DOM.');
        }
        
        document.querySelector('.search-button').addEventListener('click', function () {
            const query = document.querySelector('#searchInput').value;
            const resultsContainer = document.getElementById('searchResults');
            
            // Se la query è vuota, nascondi la tendina
            if (query.trim() === "") {
                resultsContainer.style.display = 'none';
                return;
            }
    
            // Mostra la tendina mentre si caricano i risultati
            resultsContainer.style.display = 'block';
    
            fetch(`../backend/searchProgetti.php?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    resultsContainer.innerHTML = "";
    
                    if (data.result && data.result.length > 0) {
                        data.result.forEach(progetto => {
                            const div = document.createElement("a");
                            div.href = `progetto.html?name=${encodeURIComponent(progetto.nome)}`; // Link alla pagina del progetto
                            div.classList.add("dropdown-item");
                            div.innerHTML = `
                                <h3>${progetto.nome}</h3>
                                <p>${progetto.descrizione}</p>
                            `;
                            resultsContainer.appendChild(div);
                        });
                    } else {
                        resultsContainer.innerHTML = "<p>Nessun progetto trovato.</p>";
                    }
                })
                .catch(error => {
                    console.error("Errore durante la ricerca:", error);
                });
        });
    
        // Nascondi la tendina se l'utente clicca fuori
        document.addEventListener('click', function(event) {
            const resultsContainer = document.getElementById('searchResults');
            const searchButton = document.getElementById('searchButton'); // Ottieni il bottone Cerca
            const searchInput = document.querySelector('#searchInput'); // Input di ricerca
            
            // Se l'utente clicca fuori dalla tendina, dall'input o dal bottone, nascondi la tendina
            if (!resultsContainer.contains(event.target) && !searchInput.contains(event.target) && !searchButton.contains(event.target)) {
                resultsContainer.style.display = 'none';
            }
        });


    })
    .catch(error => console.error('Error loading the navbar:', error));
});

export function isUserLoggedIn() {
    try {
        const payloadBase64 = token.split('.')[1]; // Estrae la parte payload del JWT
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodifica da Base64 a JSON
        const currentTime = Date.now() / 1000;

        if (payloadDecoded.exp < currentTime) {
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