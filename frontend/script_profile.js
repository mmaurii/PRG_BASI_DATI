import { isUserLoggedIn, getUsernameFromToken } from './script_navbar.js';

let token, btnCloseCompetenze, overlay, popUpSetLivelloCompetenze, competenzeViewer, competenzeUser, containerStatistics,
    btnSaveCompetenze, btnDisplayCompetenze, competenze = { "competenzeTotali": [], "competenzeUser": [] };


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
    containerStatistics = document.getElementById('div-statistics');

    btnCloseCompetenze.addEventListener('click', closeSetLivelloCompetenze);
    btnSaveCompetenze.addEventListener('click', saveCompetenze);
    btnDisplayCompetenze.addEventListener('click', displaySetLivelloCompetenze);

    initInterface();
});


function initInterface() {
    Promise.all([loadStatistics()]);
}

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
        let mail = getUsernameFromToken();

        //controllo che non sia null undefined o false per via di getUsernameFromToken
        if (!mail) {
            return
        }

        Promise.all([getCompetenze(null, "competenzeTotali"),
        getCompetenze(mail, "competenzeUser")])
            .then(() => {
                //visualizzo le competenze
                displayCompetenze();
                //dispaly user competenze
                displayUserCompetenze();

                //visualizzo il popUp
                overlay.style.display = "block";
                popUpSetLivelloCompetenze.style.display = "block";
            });
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

function getCompetenze(mail, key) {
    return axios.get("../backend/getCompetenze.php", {
        params: {
            mail: mail
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                competenze[key] = response.data.result;
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
}

function displayCompetenze() {
    //cleaning the finanziamenti container
    competenzeViewer.innerHTML = "";

    //read all finanziamenti and append them to the container
    competenze.competenzeTotali.forEach(competenza => {
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
    competenze.competenzeUser.forEach(competenza => {
        let inputRange = document.getElementById(competenza.competenza);
        inputRange.value = competenza.livello;
    });

}

function saveCompetenze() {
    let competenzeUpdated = [];

    //identifico le comptenze che sono state modificate
    //e le aggiungo all'array competenzeUpdated
    competenze.competenzeTotali.forEach(competenza => {
        let inputRange = document.getElementById(competenza.competenza);
        let c = competenze.competenzeUser.find(c => c.competenza === competenza.competenza);
        if (c) {
            if (c.livello != inputRange.value) {
                competenzeUpdated.push({
                    competenza: competenza.competenza,
                    livello: inputRange.value
                });
            }
        } else {
            if (inputRange.value != -1) {
                competenzeUpdated.push({
                    competenza: competenza.competenza,
                    livello: inputRange.value
                });
            }
        }
    });

    if (competenzeUpdated.length != 0) {
        if (isUserLoggedIn()) {
            let mail = getUsernameFromToken();

            //controllo che non sia null undefined o false per via di getUsernameFromToken
            if (!mail) {
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
                        alert("Competenze salvate correttamente");
                        closeSetLivelloCompetenze();
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
    } else {
        alert("Non hai modificato nessuna competenza quindi non sono state aggiornate");
    }
}

function loadStatistics() {
    return axios.get("../backend/getUserStatistics.php", {
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                let stats = response.data.result;
                containerStatistics.innerHTML = `<h2>Statistiche:</h2>
                                                <p>Numero di candidature: ${stats.nCandidature}</p>
                                                <p>Numero di commenti: ${stats.nCommenti}</p>
                                                <p>Numero di finanziamenti: ${stats.nFinanziamenti}</p>
                                                <p>Totale finanziato: ${stats.totaleFinanziato}</p>
                                                <p>Numero di competenze: ${stats.nCompetenze}</p>`;
            } else {
                console.error('Risposta non corretta dal server.', response.data);
            }
        })
        .catch(error => {
            console.error("Errore nel recupero delle statistiche:", error.response ? error.response.data.error : error.message);
            alert("Errore nel recupero delle statistiche");
        });
}