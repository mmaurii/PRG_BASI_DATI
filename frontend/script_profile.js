import { isUserLoggedIn, getUsernameFromToken } from './script_navbar.js';

let token, btnCloseCompetenze, overlay, popUpSetLivelloCompetenze, competenze, competenzeViewer, competenzeUser,
    btnSaveCompetenze, btnDisplayCompetenze;


document.addEventListener('DOMContentLoaded', async function () {
    token = JSON.parse(localStorage.getItem("jwtToken"));
    if (!isUserLoggedIn()) {
        window.location.href = "./login.html";
    }

    btnCloseCompetenze = document.getElementById('closeCompetenze');
    overlay = document.getElementById('overlay');
    popUpSetLivelloCompetenze = document.querySelector('.popUp.set-livello-competenze');
    competenzeViewer = document.querySelector('.competenze-viewer');
    btnSaveCompetenze = document.getElementById('btn-save-competenze');
    btnDisplayCompetenze = document.getElementById('btn-display-competenze');

    btnCloseCompetenze.addEventListener('click', closeSetLivelloCompetenze);
    btnSaveCompetenze.addEventListener('click', saveCompetenze);
    btnDisplayCompetenze.addEventListener('click', displaySetLivelloCompetenze);
});

function login() {
    window.location.href = './login.html';
}

function logout() {
    localStorage.removeItem("jwtToken"); // Remove the token
    window.location.reload();
}

function signup() {
    logout();
    window.location.href = './signup.html';
}

async function displaySetLivelloCompetenze() {
    if (isUserLoggedIn()) {
        //scarico i dati delle competenze
        await getCompetenze();
        //visualizzo le competenze
        displayCompetenze();
        //dispaly user competenze

        //visualizzo il popUp
        overlay.style.display = "block";
        popUpSetLivelloCompetenze.style.display = "block";

        //get user competenze
        await getUserCompetenze();
        displayUserCompetenze();
    } else {
        alert("Devi essere loggato per poter visualizzare le competenze");
        window.location.href = "./login.html";
    }
}

function closeSetLivelloCompetenze(event) {
    // Nasconde l'interfaccia di selezione del finanziamento
    overlay.style.display = "none";
    popUpSetLivelloCompetenze.style.display = "none";
}

async function getCompetenze() {
    try {
        await axios.get("../backend/getCompetenze.php", {
            params: {
                mail: ""
            },
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        })
            .then(response => {
                if (response.data.result) {
                    console.log(response.data.result);
                    competenze = response.data.result;
                } else if (response.data.error) {
                    console.error(response.data.error);
                } else {
                    console.error('Risposta non corretta dal server.', response.data);
                }
            })
            .catch(error => {
                console.error("Errore nel recupero delle competenze:", error.response ? error.response.data.error : error.message);
                alert("Errore nel recupero delle competenze");
            });
    } catch (error) {
        console.error('Errore nel caricamento delle competenze:', error);
        alert("Errore nel caricamento delle competenze");
    }
}

async function getUserCompetenze() {
    if (!isUserLoggedIn()) {
        return
    }
    let mail = getUsernameFromToken();

    //controlloo che non sia null undefined o false per via di getUsernameFromToken
    if (!mail) {
        competenzeUser = [];
        return
    }

    try {
        await axios.get("../backend/getCompetenze.php", {
            params: {
                mail: mail // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        })
            .then(response => {
                if (response.data.result) {
                    console.log(response.data.result);
                    competenzeUser = response.data.result;
                } else if (response.data.error) {
                    console.error(response.data.error);
                    competenzeUser = [];
                } else {
                    console.error('Risposta non corretta dal server.', response.data);
                    competenzeUser = [];
                }
            })
            .catch(error => {
                console.error("Errore nel recupero delle competenze:", error.response ? error.response.data.error : error.message);
                alert("Errore nel recupero delle competenze");
            });
    } catch (error) {
        console.error('Errore nel caricamento delle competenze:', error);
        alert("Errore nel caricamento delle competenze");
    }
}

function displayCompetenze() {
    //cleaning the finanziamenti container
    competenzeViewer.innerHTML = "";

    //read all finanziamenti and append them to the container
    competenze.forEach(competenza => {
        let competenzeNode = document.createElement("div");
        competenzeNode.className = "competenza";
        competenzeNode.setAttribute("tabindex", "0");
        competenzeNode.innerHTML = `
                                <p>competenza: ${competenza.competenza}</p>
                            `;

        let inputRange = document.createElement("input");
        inputRange.type = "range";
        inputRange.min = -1;
        inputRange.max = 5;
        inputRange.value = -1;
        inputRange.id = competenza.competenza;
        competenzeNode.appendChild(inputRange);

        competenzeViewer.appendChild(competenzeNode);
    });
}

function displayUserCompetenze() {
    competenzeUser.forEach(competenza => {
        let inputRange = document.getElementById(competenza.competenza);
        inputRange.value = competenza.livello;
    });

}

function saveCompetenze() {
    let competenzeUpdated = [];

    competenze.forEach(competenza => {
        let inputRange = document.getElementById(competenza.competenza);
        let c = competenzeUser.find(c => c.competenza === competenza.competenza);
        if (c) {
            if (c.livello != inputRange.value) {
                competenzeUpdated.push({
                    competenza: competenza.competenza,
                    livello: inputRange.value
                });
            }
        } else {
            competenzeUpdated.push({
                competenza: competenza.competenza,
                livello: inputRange.value
            });
        }
    });

    if (isUserLoggedIn()) {
        let mail = getUsernameFromToken();

        //controlloo che non sia null undefined o false per via di getUsernameFromToken
        if (!mail) {
            competenzeUser = [];
            return
        }

        axios.put("../backend/setLivelloCompetenze.php", {
            mail: mail,
            competenze: competenzeUpdated
        }, {
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        })
            .then(response => {
                if (response.data.result) {
                    console.log(response.data.result);
                    alert("Competenze salvate correttamente");
                    closeSetLivelloCompetenze();
                } else if (response.data.error) {
                    console.error(response.data.error);
                    alert("Errore nel salvataggio delle competenze");
                } else {
                    console.error('Risposta non corretta dal server.', response.data);
                    alert("Errore nel salvataggio delle competenze");
                }
            })
            .catch(error => {
                console.error("Errore nel salvataggio delle competenze:", error.response ? error.response.data.error : error.message);
                alert("Errore nel salvataggio delle competenze");
            });
    } else {
        alert("Devi essere loggato per poter salvare le competenze");
        window.location.href = "./login.html";
    }

}