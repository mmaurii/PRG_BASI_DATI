import { isUserLoggedIn, getRoleFromToken, getUsernameFromToken } from "./script_navbar.js";

let projectName, mail, role, projectData, comments, pictures, profili, candidatureByProfile, popUpFinanzia, 
    mailFinanziatore, overlay, btnFinanzia, rewards, rewardViewers, selectedReward = null,
    btnShowPopUpAggiungiProfilo, btnClosePopUpFinanziamento,
    popUpAggiungiProfilo, btnClosePopUpAggiungiProfilo, btnAddProfilo, competenzeSelezionate, livelliCompetenze,
    profileGrid, token, competenze = { "competenzeTotali": [], "competenzeUser": [], "competenzePerProfilo": [] };

const currentDate = new Date();
let today = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

document.addEventListener('DOMContentLoaded', async function () {
    rewardViewers = Array.from(document.getElementsByClassName('reward-viewer'));
    btnFinanzia = document.getElementById('finanzia');
    overlay = document.getElementById('overlay');
    mailFinanziatore = document.getElementById('mail');
    popUpFinanzia = document.querySelector('.popUp.finanzia');
    btnClosePopUpFinanziamento = document.getElementById('close-finanziamento');
    profileGrid = document.querySelector(".profile-grid")
    btnShowPopUpAggiungiProfilo = document.querySelector(".add-profile-button");
    popUpAggiungiProfilo = document.querySelector(".popUp.aggiungi-profilo");
    btnClosePopUpAggiungiProfilo = document.getElementById('close-aggiungiProfilo'); // Potresti voler usare un altro ID per il pulsante di chiusura
    btnAddProfilo = document.querySelector("#aggiungi");

    btnClosePopUpFinanziamento.addEventListener('click', closeFinanziamento);
    btnFinanzia.addEventListener('click', addFinanziamento);
    btnShowPopUpAggiungiProfilo.addEventListener('click', showFormAddProfile);
    btnClosePopUpAggiungiProfilo.addEventListener('click', closeFormAddProfile);
    document.getElementById('finanziamento').addEventListener('click', displayFinanziamento);
    document.querySelector('.submit-comment').addEventListener('click', sendComment);

    //creazione interfaccia
    await initInterface();

})
async function initInterface() {
    try {
        const params = new URLSearchParams(window.location.search);
        projectName = params.get('name');
        token = JSON.parse(localStorage.getItem("jwtToken"));

        if (isUserLoggedIn()) {
            mail = getUsernameFromToken(token.token);
            role = getRoleFromToken(token.token);
        }

        await getProject();
        updateDataFinanceInterface();   //imposta i dati del progetto, nome, tipo ecc...

        await Promise.all([
            getCompetenze(null, "competenzeTotali").then(initPopUpAddProfile),      //crea il popUp con i dati raccolti delle competenze totali (nascosto inizialmente da css)
            getPictures().then(addScrollImg),       //mostra e crea logica per scorrere le foto nel caso ce ne siano più di una
            getComments().then(displayComments),        //mostra tutti i commenti associati a quel progetto
            getRewards().then(displayRewards),      //mostra tutte le rewards legate a quel progetto
            getProfiliByProgetto().then(displayProfili)     //mostra profili richiesti per quel progetto
        ]);

        if (profili.length === 0) {
            document.querySelector("#search-profile").innerText = "Nessun profilo richiesto al momento"
        }

        // Controlla se l'utente è il creatore del progetto, si possono aggiungere profili solo se il prgetto è di tipo software
        if (mail === projectData.mailC && projectData.tipo === "Software") {
            btnShowPopUpAggiungiProfilo.style.display = "block";
        }
    } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
    }

}
function initPopUpAddProfile() {
    //aggiunta form popup in base alle competenze, aggiunta eventi legati alla scelta delle competenze per profilo
    let listaCompetenze = document.getElementById('lista-competenze');
    competenzeSelezionate = []; // Array delle competenze selezionate
    livelliCompetenze = {};
    competenze.competenzeTotali.forEach(item => {
        let label = document.createElement('label');
        label.classList.add("checkbox-item");

        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = item.competenza;

        // Crea un range associato alla checkbox
        let range = document.createElement('input');
        range.type = "range";
        range.min = "0";
        range.max = "5";
        range.value = "0";
        range.classList.add("range-slider");
        range.disabled = true; // Disabilitato finché la checkbox non è selezionata

        // Gestione dell'evento di selezione della checkbox
        checkbox.addEventListener("change", function () {
            if (checkbox.checked) {
                competenzeSelezionate.push(item.competenza);
                livelliCompetenze[item.competenza] = range.value; // Salva il livello iniziale
                range.disabled = false; // Attiva il range
            } else {
                competenzeSelezionate = competenzeSelezionate.filter(c => c !== item.competenza);
                delete livelliCompetenze[item.competenza]; // Rimuove il livello
                range.value = 0; // Resetta il livello a 0
                range.disabled = true; // Disabilita il range
            }
        });

        // Gestione dell'evento di cambiamento del livello (quando si sposta il range)
        range.addEventListener("input", function () {
            if (checkbox.checked) {
                livelliCompetenze[item.competenza] = range.value; // Aggiorna il livello
            }
        });

        // Aggiungi la checkbox e il range nel label
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + item.competenza));
        label.appendChild(range);

        listaCompetenze.appendChild(label);
    });

    btnAddProfilo.addEventListener('click', function () {
        const nomeProfilo = document.querySelector("#nome-profilo")
        let nome = nomeProfilo.value;
        let comp = competenzeSelezionate
        let liv = livelliCompetenze

        nomeProfilo.value = "";

        addProfile(nome, comp, liv)
    });
}

function initPopUpViewCandidature(idProfilo) {
    const popUp = document.querySelector(".manage-candidature");
    const overlay = document.getElementById("overlay");
    const candidatureViewer = document.querySelector(".candidature-viewer");

    // Pulisce la lista precedente (se presente)
    candidatureViewer.innerHTML = "";

    // Controlla se l'array è vuoto
    if (candidatureByProfile.length === 0) {
        const noCandidatesMsg = document.createElement("p");
        noCandidatesMsg.textContent = "Ancora nessuna candidatura.";
        noCandidatesMsg.classList.add("no-candidates-msg"); // Aggiunta classe
        candidatureViewer.appendChild(noCandidatesMsg);
    }
    else {
        // Crea e aggiungi le candidature
        candidatureByProfile.forEach(element => {
            let candidateItem = document.createElement("div");
            candidateItem.classList.add("candidate-item");

            let candidateEmail = document.createElement("span");
            candidateEmail.textContent = element.mail;

            // Bottone "Accetta"
            let acceptButton = document.createElement("button");
            acceptButton.textContent = "Accetta";
            acceptButton.classList.add("accept-btn");
            acceptButton.addEventListener("click", function () {
                accettaCandidatura(idProfilo, element.mail, acceptButton, rejectButton);
            });

            // Bottone "Rifiuta"
            let rejectButton = document.createElement("button");
            rejectButton.textContent = "Rifiuta";
            rejectButton.classList.add("reject-btn");
            rejectButton.addEventListener("click", function () {
                rifiutaCandidatura(idProfilo, element.mail, acceptButton, rejectButton);
            });

            if (element.stato === "accepted") {
                acceptButton.disabled = true;
                rejectButton.disabled = false;
                acceptButton.style.backgroundColor = "#a8d08d";
            } else if (element.stato === "rejected") {
                acceptButton.disabled = false;
                rejectButton.disabled = true;
                rejectButton.style.backgroundColor = "#f1b0b0";
            }

            // Aggiungi gli elementi
            candidateItem.appendChild(candidateEmail);
            candidateItem.appendChild(acceptButton);
            candidateItem.appendChild(rejectButton);

            // Aggiungi l'elemento alla lista
            candidatureViewer.appendChild(candidateItem);
        });
    }

    popUp.style.display = "none";
    overlay.style.display = "none";

    // Funzione per chiudere il popup e l'overlay
    document.getElementById("close-manageCandidature").addEventListener("click", closeManageCandidatura);
}

function displayProfili() {
    profili.forEach(async (element) => {
        await getCompetenzeByProfile(element.id);

        templateProfile(element)
    });
}

function displayComments() {
    comments.forEach(element => {
        templateComment(element.testo, element.data, element.mail, element.id)
    });
}

function addScrollImg() {
    if (pictures) {
        const projectImages = pictures[projectName];

        projectImages.forEach(element => {
            let image = document.createElement("img");
            image.src = element.foto;
            document.querySelector(".project-images").appendChild(image);
        });
    }
    const projectImages = document.querySelector('.project-images');
    const images = projectImages.querySelectorAll('img');
    const scrollLeftButton = document.querySelector('.scroll-left');
    const scrollRightButton = document.querySelector('.scroll-right');

    let currentIndex = 0; // Per tracciare quale immagine è visibile

    // Funzione per spostarsi a sinistra
    scrollLeftButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--; // Decrescere l'indice
            const newTransformValue = -(currentIndex * 100); // Spostare il contenuto per mostrare l'immagine precedente
            projectImages.style.transform = `translateX(${newTransformValue}%)`;
        }
    });

    // Funzione per spostarsi a destra
    scrollRightButton.addEventListener('click', () => {
        if (currentIndex < images.length - 1) {
            currentIndex++; // Aumentare l'indice
            const newTransformValue = -(currentIndex * 100); // Spostare il contenuto per mostrare l'immagine successiva
            projectImages.style.transform = `translateX(${newTransformValue}%)`;
        }
    });
}
async function accettaCandidatura(idProfilo, mail, btnAcc, btnRej) {
    const data = {
        nomeUtente: mail,
        idProfilo: idProfilo,
        statoCandidatura: "accepted"
    };

    await axios.put("../backend/manageApplicationStatus.php", data, {
        headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
    })
        .then(response => {
            if (response.data) {
                alert("candidatura accettata")
                btnAcc.disabled = true;
                btnRej.disabled = false;
                btnAcc.style.backgroundColor = "#a8d08d";
                btnRej.style.backgroundColor = "red";
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}
async function rifiutaCandidatura(idProfilo, mail, btnAcc, btnRej) {
    const data = {
        nomeUtente: mail,
        idProfilo: idProfilo,
        statoCandidatura: "rejected"
    };

    await axios.put("../backend/manageApplicationStatus.php", data, {
        headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
    })
        .then(response => {
            if (response.data) {
                alert("candidatura rifiutata")
                btnAcc.disabled = false;
                btnRej.disabled = true;
                btnAcc.style.backgroundColor = "green";
                btnRej.style.backgroundColor = "#f1b0b0";
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}

function closeManageCandidatura() {
    document.querySelector(".manage-candidature").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}
async function showManageCandidatura(idProfilo) {
    try {
        await getCandidatureByProfile(idProfilo);
        // inizializzo i popUp solo se la chiamata ha successo
        initPopUpViewCandidature(idProfilo);

        const popUp = document.querySelector(".manage-candidature");
        const overlay = document.getElementById("overlay");
        // Mostra il popup e l'overlay
        popUp.style.display = "block";
        overlay.style.display = "block";
    } catch (err) {
        console.error("Errore nella richiesta delle candidature:", err);
        // opzionale: mostra un messaggio di errore all'utente
    }
}

async function addProfile(nome, comp, liv) {
    mail = getUsernameFromToken();
    if (nome) {
        const data = {
            nomeProfilo: nome,
            nomeProgetto: projectName,
            mail: mail,
        };

        await axios.post("../backend/addProfileForProjectSoft.php", data, {
            headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
        })
            .then(response => {
                if (response.data) {
                    document.querySelector("#search-profile").innerText = "Stiamo cercando profili con le seguenti competenze per aiutarci nel nostro progetto:";
                    let idProfilo = response.data.profileID
                    comp.forEach((element) => {
                        popola_s_p(idProfilo, element, liv[element])
                    });
                    templateProfileFromButtonAdd(nome, comp, liv, idProfilo);
                    closeFormAddProfile();
                } else if (response.data.error) {
                    console.error(response.data.error);
                } else {
                    console.error('Risposta non corretta dal server.');
                }
            })
            .catch(error => {
                let msg = error.response ? error.response.data : error.message;
                console.error("Access denied:", msg);
                alert(msg);
            });
    } else {
        alert("inserisci il nome")
    }

}

function templateProfileFromButtonAdd(name, comp, liv, idProfilo) {
    let profileCard = document.createElement("div");
    profileCard.classList.add("profile-card");

    profileCard.id = idProfilo;

    let profileName = document.createElement("h3");
    profileName.innerText = name;
    profileCard.appendChild(profileName);

    let TitoloCompetenza = document.createElement("h4");
    TitoloCompetenza.innerText = "Competenze richieste";
    profileCard.appendChild(TitoloCompetenza);

    let ulCompetenza = document.createElement("ul");
    ulCompetenza.classList.add("competence-list");

    comp.forEach(element => {
        let li = document.createElement("li");
        li.classList.add("competence-item");

        let spanCompetenza = document.createElement("span");
        spanCompetenza.textContent = `${element}`;
        spanCompetenza.classList.add("competence-name");

        let spanLivello = document.createElement("span");
        spanLivello.textContent = "Livello: " + liv[element];
        spanLivello.livello = liv[element];
        spanLivello.classList.add("competence-level");

        li.appendChild(spanCompetenza);
        li.appendChild(spanLivello);
        ulCompetenza.appendChild(li);
    });


    profileCard.appendChild(ulCompetenza);


    let applyButton = document.createElement("button");
    applyButton.textContent = "Candidati";
    applyButton.classList.add("apply-button");
    applyButton.addEventListener('click', applyForProfile);

    profileCard.appendChild(applyButton);

    // Bottone "Visualizza candidature"
    let viewApplicationsButton = document.createElement("button");
    viewApplicationsButton.textContent = "Visualizza candidature";
    viewApplicationsButton.classList.add("apply-button");
    viewApplicationsButton.style.backgroundColor = "#004d99"; // blu scuro
    viewApplicationsButton.addEventListener('click', function () {
        showManageCandidatura(idProfilo);
    });

    profileCard.appendChild(viewApplicationsButton);

    if (mail === projectData.mailC) {
        applyButton.style.display = "none";
    } else {
        viewApplicationsButton.style.display = "none"
    }

    profileGrid.appendChild(profileCard);
}

async function popola_s_p(id, comp, liv) {
    const data = {
        competenza: comp,
        idProfilo: id,
        livello: parseInt(liv, 10)
    };

    await axios.post("../backend/popola_s_p.php", data, {
        headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
    }).catch(error => {
        let msg = error.response ? error.response.data : error.message;
        console.error("Access denied:", msg);
        alert(msg);
    });
}

async function getCompetenze(mail, key) {
    await axios.get("../backend/getCompetenze.php", {
        params: {
            mail: mail
        },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
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
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}


async function getCompetenzeByProfile(element) {
    await axios.get("../backend/getCompetenzeByProfile.php", {
        params: {
            profilo: element // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                competenze.competenzePerProfilo = response.data.result;
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}

async function getCandidatureByProfile(idProfilo) {
    await axios.get("../backend/getCandidatureByProfiloId.php", {
        params: {
            id: idProfilo
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                candidatureByProfile = response.data.result;
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}

async function getProfiliByProgetto() {
    await axios.get("../backend/getProfiliByProgetto.php", {
        params: {
            progetto: projectName // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                profili = response.data.result;
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}
async function getRewards() {
    try {
        await axios.get("../backend/getRewards.php", {
            params: {
                nomeProgetto: projectName // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        })
            .then(response => {
                if (response.data.result) {
                    rewards = response.data.result;
                } else if (response.data.error) {
                    console.error(response.data.error);
                } else {
                    console.error('Risposta non corretta dal server.');
                }
            })
            .catch(error => {
                let msg = error.response ? error.response.data : error.message;
                console.error("Access denied:", msg);
                alert(msg);
            });
    } catch (error) {
        console.error('Errore nel caricamento delle rewards:', error);
    }
}

async function getPictures() {
    await axios.get("../backend/getFotoByProgetto.php", {
        params: {
            progetti: [projectName]
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result.length !== 0) {
                pictures = response.data.result;
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
            //window.location.href = "login.html"; // Redirect if unauthorized
        });
}

async function getComments() {
    await axios.get("../backend/getCommentsByProgetto.php", {
        params: {
            progetto: projectName // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                comments = response.data.result;
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}
async function getProject() {
    await axios.get("../backend/getProjectByName.php", {
        params: {
            progetto: projectName // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result) {
                projectData = response.data.result;
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}

function showFormAddProfile() {
    popUpAggiungiProfilo.style.display = 'flex';  // Mostra il pop-up con display flex
    overlay.style.display = 'block';  // Mostra l'overlay
}

function closeFormAddProfile() {
    popUpAggiungiProfilo.style.display = 'none';  // Nasconde il pop-up
    overlay.style.display = 'none';  // Nasconde l'overlay

    document.querySelectorAll("#lista-competenze input[type='checkbox']").forEach(checkbox => {
        checkbox.checked = false;
    });

    document.querySelectorAll("#lista-competenze input[type='range']").forEach(range => {
        range.value = 0;
        range.disabled = true; // Disabilita nuovamente il range
    });

    // Svuota gli array di selezione
    competenzeSelezionate = [];
    livelliCompetenze = {};
}

function showReplyForm(button) {
    var replyForm = button.nextElementSibling;
    replyForm.firstElementChild.value = "";

    if (replyForm.style.display == "block") {
        replyForm.style.display = "none";
    }
    else {
        replyForm.style.display = "block";
    }
    // Nasconde altri moduli di risposta aperti
    var allReplyForms = document.querySelectorAll(".reply-form");
    allReplyForms.forEach(function (form) {
        if (form !== replyForm) {
            form.style.display = "none";
        }
    });
}
function sendReply(text, idComment, divReply, btnReply) {
    if (text.value) {
        if (!token) {
            window.location.href = "login.html"; // Redirect if no token
        } else {
            // Prepara i dati da inviare al server
            const data = {
                id: idComment,
                risposta: text.value,
            };

            axios.put("../backend/addResponseToComment.php", data, {
                headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
            })
                .then(response => {
                    divReply.style.display = "none"
                    btnReply.style.display = "none"

                    let textReply = document.createElement("p")
                    textReply.classList.add("styled-reply");
                    textReply.innerHTML = `<strong>Risposta:</strong> ${text.value}`;

                    let creatorReference = document.createElement("span");
                    creatorReference.classList.add("creator-reference");
                    creatorReference.textContent = projectData.mailC;

                    let replyContainer = document.createElement("div");
                    replyContainer.classList.add("reply-container");

                    replyContainer.appendChild(textReply);
                    replyContainer.appendChild(creatorReference);

                    btnReply.parentNode.appendChild(replyContainer);

                    text.value = "";
                })
                .catch(error => {
                    let msg = error.response ? error.response.data : error.message;
                    console.error("Access denied:", msg);
                    alert(msg);
                });

        }

    }

}

function sendComment() {
    let text = document.querySelector("#textComment").value;
    if (text) {
        if (!token) {
            window.location.href = "login.html"; // Redirect if no token
        } else {
            // Prepara i dati da inviare al server
            const data = {
                mail: mail,
                nomeProgetto: projectName,
                testo: text,
                data: today
            };

            axios.post("../backend/addComment.php", data, {
                headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
            })
                .then(response => {
                    templateComment(text, today, mail, response.data.comment_id);
                })
                .catch(error => {
                    let msg = error.response ? error.response.data : error.message;
                    console.error("Access denied:", msg);
                    alert("Devi effettuare l'accesso prima di poter inviare un commento");
                });
        }
    }
    document.querySelector("#textComment").value = ""
}

function templateProfile(element) {
    /*
    esempio template del profilo:
        <div class="profile-card">
            <h3>Mario Rossi</h3>
            <h4>Competenze richieste</h4>
            <ul class="competence-list">
                <li class="competence-item">
                    <span class="competence-name">JavaScript</span>
                    <span class="competence-level">Livello: Avanzato</span>
                </li>
                <li class="competence-item">
                    <span class="competence-name">HTML & CSS</span>
                    <span class="competence-level">Livello: Intermedio</span>
                </li>
                <li class="competence-item">
                    <span class="competence-name">React</span>
                    <span class="competence-level">Livello: Base</span>
                </li>
            </ul>
            <button class="apply-button">Candidati</button>
        </div>
    */
    let profileCard = document.createElement("div");
    profileCard.classList.add("profile-card");
    profileCard.id = element.id;

    let profileName = document.createElement("h3");
    profileName.innerText = element.nome;
    profileCard.appendChild(profileName);

    let TitoloCompetenza = document.createElement("h4");
    TitoloCompetenza.innerText = "Competenze richieste";
    profileCard.appendChild(TitoloCompetenza);

    let ulCompetenza = document.createElement("ul");
    ulCompetenza.classList.add("competence-list");

    competenze.competenzePerProfilo.forEach(element => {
        let li = document.createElement("li");
        li.classList.add("competence-item");

        let spanCompetenza = document.createElement("span");
        spanCompetenza.textContent = `${element.competenza}`;
        spanCompetenza.classList.add("competence-name");

        let spanLivello = document.createElement("span");
        spanLivello.textContent = `Livello: ${element.livello}`;
        spanLivello.livello = element.livello;
        spanLivello.classList.add("competence-level");

        li.appendChild(spanCompetenza);
        li.appendChild(spanLivello);
        ulCompetenza.appendChild(li);
    });

    profileCard.appendChild(ulCompetenza);

    // Bottone "Candidati"
    let applyButton = document.createElement("button");
    applyButton.textContent = "Candidati";
    applyButton.classList.add("apply-button");
    applyButton.addEventListener('click', applyForProfile);
    profileCard.appendChild(applyButton);

    // Bottone "Visualizza candidature"
    let viewApplicationsButton = document.createElement("button");
    viewApplicationsButton.textContent = "Visualizza candidature";
    viewApplicationsButton.classList.add("apply-button");
    viewApplicationsButton.style.backgroundColor = "#004d99"; // blu scuro
    viewApplicationsButton.addEventListener('click', function () {
        showManageCandidatura(element.id);
    });

    profileCard.appendChild(viewApplicationsButton);

    if (mail === projectData.mailC) {
        applyButton.style.display = "none";
    } else {
        viewApplicationsButton.style.display = "none"
    }


    profileGrid.appendChild(profileCard);
}

function templateComment(text, mysqlDate, creatore, id) {
    /*
    esempio template del commento:
    <li class="comment" data-comment-id="3">
        <div class="comment-user">
            <p><strong>Utente3</strong> - 3 ore fa</p>
        </div>
        <p>Ottima idea, ho già contribuito con €50!</p>
        <div class="reply-section">
            <button class="reply-button creator-only">Rispondi</button>
            <div class="reply-form">
                <textarea class="reply-text" placeholder="Scrivi una risposta..."></textarea>
                <button class="send-reply">Invia</button>
            </div>
        </div>
        
    </li>
    */
    let container = document.querySelector(".comment-list")

    let li = document.createElement("li")
    li.classList.add("comment")
    container.appendChild(li)

    let divCommentUser = document.createElement("div")
    divCommentUser.classList.add("comment-user")
    li.appendChild(divCommentUser)

    let autore = document.createElement("p")
    let data = document.createTextNode(" " + mysqlDate)

    autore.innerHTML = "<strong>" + creatore + "</strong>"
    autore.appendChild(data)
    divCommentUser.appendChild(autore)

    let textComment = document.createElement("p")
    textComment.innerText = text
    li.appendChild(textComment)

    let divReplaySection = document.createElement("div")
    divReplaySection.classList.add("reply-section")
    li.appendChild(divReplaySection)

    let buttonRispondi = document.createElement("button")
    buttonRispondi.classList.add("reply-button")
    buttonRispondi.classList.add("creator-only")

    if (mail === projectData.mailC) {  // Controlla se l'utente è il creatore del progetto
        buttonRispondi.style.display = "block";
    }
    buttonRispondi.innerText = "Rispondi"
    divReplaySection.appendChild(buttonRispondi)

    let divForm = document.createElement("div")
    divForm.classList.add("reply-form")
    divReplaySection.appendChild(divForm)

    //verifica se il commento ha risposta
    let comment = comments.find(c => c.id === id);
    if (comment && comment.risposta) {    //se chiamato da init comment è true in quanto dentro allla lista comments e si poi si verifica se ha la risposta, se invece chiamato da addComment sicuro non avrà risposta e sicuro non sarà dentro alla lista
        divForm.style.display = "none"
        buttonRispondi.style.display = "none"

        let textReply = document.createElement("p")
        textReply.classList.add("styled-reply");
        textReply.innerHTML = `<strong>Risposta:</strong> ${comment.risposta}`;

        let creatorReference = document.createElement("span");
        creatorReference.classList.add("creator-reference");
        creatorReference.textContent = projectData.mailC;

        let replyContainer = document.createElement("div");
        replyContainer.classList.add("reply-container");

        replyContainer.appendChild(textReply);
        replyContainer.appendChild(creatorReference);

        divReplaySection.appendChild(replyContainer)
    }
    let textRisposta = document.createElement("textarea")
    textRisposta.classList.add("reply-text")
    textRisposta.placeholder = "Scrivi una risposta..."
    divForm.appendChild(textRisposta)

    let buttonInvia = document.createElement("button")
    buttonInvia.classList.add("send-reply")
    buttonInvia.innerText = "Invia"
    divForm.appendChild(buttonInvia)

    buttonRispondi.addEventListener('click', function () {
        showReplyForm(buttonRispondi);
    });
    buttonInvia.addEventListener('click', function () {
        sendReply(textRisposta, id, divForm, buttonRispondi);
    });

}

function getGiorniRimasti(dataLimite) {
    const dataOggi = new Date(today);
    const dataScadenza = new Date(dataLimite);

    // Calcola la differenza in millisecondi
    const differenzaMs = dataScadenza - dataOggi;

    // Calcola il numero di giorni
    const giorni = Math.floor(differenzaMs / (1000 * 60 * 60 * 24));

    return giorni;  // Restituisce la differenza in giorni
}

function displayFinanziamento(event) {
    //verifico che il progetto sia aperto
    if (projectData.stato == "aperto") {
        //verifico che l'utente sia loggato
        if (isUserLoggedIn()) {
            //verifico che il progetto non sia chiuso
            if (projectData.budget > projectData.totale_finanziato && today <= projectData.dataLimite) {
                //visualizzo l'interfaccia di finanziamento
                overlay.style.display = "block";
                popUpFinanzia.style.display = "flex";
                mailFinanziatore.innerText = mail;

                if (selectedReward) {
                    let rewardDOMNodes = document.querySelectorAll(".reward");
                    rewardDOMNodes.forEach(reward => {
                        if (reward.querySelector("img")?.getAttribute("cod") == selectedReward) {
                            reward.classList.add("selected");
                        }
                    });
                }
            } else {
                alert("Progetto non finanziabile, il progetto è chiuso perchè il budget è stato raggiunto o la data limite è scaduta");
            }
        } else {
            alert("Devi essere loggato per poter finanziare il progetto");
            window.location.href = "./login.html";
        }
    } else {
        alert("Progetto non finanziabile, il progetto è chiuso perchè il budget è stato raggiunto o la data limite è scaduta");
    }
}

function closeFinanziamento(event) {
    // Pulisce i campi dell'interfaccia
    document.getElementById('importo').value = "";
    setUnselect(event, ".reward");
    selectedReward = null;
    // Nasconde l'interfaccia di finanziamento
    overlay.style.display = "none";
    popUpFinanzia.style.display = "none";
}

function addFinanziamento(event) {
    let importo = document.getElementById('importo').value;

    if (importo == "" || isNaN(importo) || importo <= 0) {
        alert("Inserire un importo valido");
        return;
    }

    if (mail == null || projectName == null || importo == null) {
        alert("Errore nei dati inseriti");
        return;
    }

    if (importo > projectData.budget - projectData.totale_finanziato) {
        alert("Importo superiore al budget rimanente, finanziato solo il budget rimanente");
        importo = projectData.budget - projectData.totale_finanziato;
    }

    // Prepara i dati da inviare al server
    const data = {
        mail: mail,
        nomeProgetto: projectName,
        dataFinanziamento: today,
        importoFinanziamento: importo,
        codiceReward: selectedReward
    };

    axios.post("../backend/finanziaProgetto.php", data, {
        headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
    })
        .then(response => {
            if (response.data.result) {
                //aggiorno l'importo totale finanziato
                projectData.totale_finanziato = parseInt(importo) + parseInt(projectData.totale_finanziato);
                updateDataFinanceInterface();
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }

            closeFinanziamento(event);
        })
        .catch(error => {
            let msg = error.response ? error.response.data.error : error.message;
            alert(msg);
        });

}

function displayRewards() {
    //cleaning the rewards container
    rewardViewers.forEach(element => {
        element.innerHTML = "";
    });

    //read all rewards and append them to all the containers
    rewards.forEach(reward => {
        let rewardNode = document.createElement("div");
        rewardNode.className = "reward";
        rewardNode.setAttribute("tabindex", "0");
        rewardNode.innerHTML = `
                            <div class="divimg">
                            <img src="${reward.foto}" cod="${reward.cod}" alt="foto reward: ${reward.cod}">
                            </div>
                            <p>${reward.descrizione}</p>
                        `;

        rewardViewers.forEach(element => {
            let rewardNodeCopy = rewardNode.cloneNode(true);
            rewardNodeCopy.addEventListener("click", selectReward);
            element.appendChild(rewardNodeCopy);
        });
    });

    rewardViewers.forEach(element => {
        if (element.children.length === 0) {
            let noReward = document.createElement("p")
            noReward.innerText = "Nessuna reward disponibile"
            element.appendChild(noReward)
        }
    });
}

function selectReward(event) {
    setUnselect(event, ".reward");

    let targetNode = event.target.closest(".reward");
    targetNode.classList.add("selected");
    selectedReward = targetNode.querySelector("img")?.getAttribute("cod");
}

function setUnselect(event, queryCSS) {
    if (queryCSS || queryCSS != "") {
        let DOMNodes = document.querySelectorAll(queryCSS);
        DOMNodes.forEach(element => {
            element.classList.remove("selected");
        });
    } else {
        throw new Error("queryCSS non definito");
    }
}

function updateDataFinanceInterface() {
    let giorniRimasti = getGiorniRimasti(projectData.dataLimite);
    document.title = projectName;
    document.querySelector(".project-title").innerText = projectName;
    document.querySelector(".subtitle").innerText = projectData.descrizione;
    document.querySelector("#creator-name").innerText = projectData.mailC;
    document.querySelector("#days-left").innerText = giorniRimasti;
    document.querySelector("#amount").innerText = projectData.totale_finanziato;
    document.querySelector("#budget").innerText = "raccolti di " + projectData.budget;
    document.querySelector("#percentuale").innerText = Math.floor((projectData.totale_finanziato / projectData.budget) * 100) + "%";
    document.querySelector(".progress").style.width = Math.floor((projectData.totale_finanziato / projectData.budget) * 100) + "%";
}

async function applyForProfile(event) {

    if (isUserLoggedIn()) {
        mail = getUsernameFromToken();

        //controlloo che non sia null undefined o false per via di getUsernameFromToken
        if (!mail || (mail === projectData.mailC)) {
            alert("il creatore non può candidarsi")
            return
        }

        //ottengo le competenze dell'utente
        await getCompetenze(mail, "competenzeUser");
        //identifico dove l'utente ha cliccato e ne ottengo le competenze
        let CompetenzeClickedProfile = event.target.parentElement.querySelectorAll(".competence-item");
        let competenzeProfileMapped = Array.from(CompetenzeClickedProfile).map((e) => {
            return {
                "competenza": e.querySelector(".competence-name").textContent,
                "livello": e.querySelector(".competence-level").livello
            };
        });
        //verifico che le competenze dell'utente e del profilo siano compatibili
        //if (competenze.competenzeUser.some(r => competenzeProfileMapped.some(e => e.competenza === r.competenza && e.livello <= r.livello))) {
        if (competenzeProfileMapped.every(compP => competenze.competenzeUser.some(compU => compU.competenza === compP.competenza && compP.livello <= compU.livello))) {
            //candido l'utente al profilo
            await addCandidatura(event.target.parentElement.id);
        } else {
            alert("Le tue competenze non sono compatibili con quelle richieste dal profilo");
            return;
        }
    } else {
        alert("Devi essere loggato per poter candidarti ad un profilo");
        window.location.href = "./login.html";
        return;
    }
}

async function addCandidatura(id) {
    const data = {
        mail: mail,
        id: id,
    };

    await axios.post("../backend/addCandidatura.php", data, {
        headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
    })
        .then(response => {
            if (response.status == 200) {
                alert("Candidatura inviata con successo");
            } else {
                console.error(response);
                alert("Errore nell'invio della candidatura");
            }
        })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
        });
}