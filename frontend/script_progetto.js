import { isUserLoggedIn, getRoleFromToken, getUsernameFromToken } from "./script_navbar.js";

let projectName, mail, projectData, comments, role, pictures, profili, popUpFinanzia, btnClosePopUpFinanziamento,
    mailFinanziatore, overlay, btnFinanzia, rewards, rewardViewers, selectedReward = "", btnUnselectReward,
    btnSelectReward, popUpSelectFinanziamento, btnClosePopUpSelectFinanziamento, btnSelectFinanziamento, btnShowPopUpAggiungiProfilo,
    popUpAggiungiProfilo, btnClosePopUpAggiungiProfilo, btnAddProfilo,
    finanziamentiUtente, finanziamentoViewer, selectedFinanziamento = "", profileGrid, token,
    competenze = { "competenzeTotali": [], "competenzeUser": [], "competenzePerProfilo": [] };

const currentDate = new Date();
let today = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

document.addEventListener('DOMContentLoaded', async function () {
    finanziamentoViewer = document.querySelector('.finanziamento-viewer');
    btnSelectFinanziamento = document.getElementById('btn-select-finanziamento');
    btnSelectReward = document.querySelector('.select-reward');
    btnUnselectReward = document.querySelector('.unselect-reward');
    rewardViewers = Array.from(document.getElementsByClassName('reward-viewer'));
    btnFinanzia = document.getElementById('finanzia');
    overlay = document.getElementById('overlay');
    mailFinanziatore = document.getElementById('mail');
    popUpFinanzia = document.querySelector('.popUp.finanzia');
    popUpSelectFinanziamento = document.querySelector('.popUp.select-finanziamento');
    btnClosePopUpFinanziamento = document.getElementById('close-finanziamento');
    btnClosePopUpSelectFinanziamento = document.getElementById('close-selectFinanziamento');
    profileGrid = document.querySelector(".profile-grid")
    btnShowPopUpAggiungiProfilo = document.querySelector(".add-profile-button");
    popUpAggiungiProfilo = document.querySelector(".popUp.aggiungi-profilo");
    btnClosePopUpAggiungiProfilo = document.getElementById('close-aggiungiProfilo'); // Potresti voler usare un altro ID per il pulsante di chiusura
    btnAddProfilo = document.querySelector("#aggiungi");

    btnClosePopUpFinanziamento.addEventListener('click', closeFinanziamento);
    btnFinanzia.addEventListener('click', addFinanziamento);
    btnUnselectReward.addEventListener('click', setUnselect);
    btnSelectReward.addEventListener('click', displaySelectFinanziamento);
    btnClosePopUpSelectFinanziamento.addEventListener('click', closeSelectFinanziamento);
    btnSelectFinanziamento.addEventListener('click', associateRewardToFinanziamento);
    btnShowPopUpAggiungiProfilo.addEventListener('click', showFormAddProfile);
    btnClosePopUpAggiungiProfilo.addEventListener('click', closeFormAddProfile);

    await getCompetenze("", "competenzeTotali");

    let livelloRange = document.getElementById('livello');
    let livelloValore = document.getElementById('livello-valore');

    livelloRange.addEventListener('input', function () {
        let valoreLivello = livelloRange.value;
        livelloValore.textContent = valoreLivello;
    });

    let selectElement = document.getElementById('competenza');

    competenze.competenzeTotali.forEach(item => {
        const option = document.createElement('option');
        option.value = item.competenza;
        option.textContent = item.competenza;
        selectElement.appendChild(option);
    });

    btnAddProfilo.addEventListener('click', function () {
        let nomeProfilo = document.querySelector("#nome-profilo")
        let comp = selectElement.value
        let liv = livelloValore.textContent
        addProfile(nomeProfilo, comp, liv)
    });

    await initInterface();


    const projectImages = document.querySelector('.project-images');
    const images = projectImages.querySelectorAll('img');
    const scrollLeftButton = document.querySelector('.scroll-left');
    const scrollRightButton = document.querySelector('.scroll-right');


    document.getElementById('finanziamento').addEventListener('click', displayFinanziamento);
    document.querySelector('.submit-comment').addEventListener('click', sendComment);

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
})

function initInterface() {
    try {
        const params = new URLSearchParams(window.location.search);
        projectName = params.get('name');
        token = JSON.parse(localStorage.getItem("jwtToken"));

        if (isUserLoggedIn()) {
            mail = getUsernameFromToken(token.token);
            role = getRoleFromToken(token.token);
        }


        Promise.all([getProject(), getPictures(), getComments(), getRewards(), getProfiliByProgetto()]).then(() => {
            updateDataFinanceInterface();

            if (pictures) {
                pictures.forEach(element => {
                    let image = document.createElement("img")
                    document.querySelector(".project-images").appendChild(image)
                    image.src = element.foto;
                });
            }

            comments.forEach(element => {
                templateComment(element.testo, element.data, element.mail, element.id)
            });

            displayRewards();

            profili.forEach(async (element) => {
                await getCompetenzeByProfile(element.id);

                templateProfile(element)
            });

            if (profili.length === 0) {
                document.querySelector("#search-profile").innerText = "Nessun profilo richiesto al momento"
            }
            if (mail === projectData.mailC && projectData.tipo === "Software") {  // Controlla se l'utente è il creatore del progetto
                btnShowPopUpAggiungiProfilo.style.display = "block";
            }

            console.log("progetto caricato con successo!")
        });
    } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
    }

}
async function addProfile(nome, comp, liv) {
    //console.log("profilo inserito")
    const data = {
        nomeProfilo: nome.value,
        nomeProgetto: projectName,
    };

    await axios.post("../backend/addProfileForProjectSoft.php", data, {
        headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
    })
        .then(response => {
            if (response.data) {
                //console.log(response.data);

                if (popola_s_p(response.data.profileID, comp, liv)) {
                    prova(nome.value, Array.of(comp), liv);
                }
                closeFormAddProfile();
                nome.value = "";
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data : error.message);
        });


}
function prova(name, comp, liv) {
    let profileCard = document.createElement("div");
    profileCard.classList.add("profile-card");

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
        spanLivello.textContent = `Livello: ${liv}`;
        spanLivello.classList.add("competence-level");

        li.appendChild(spanCompetenza);
        li.appendChild(spanLivello);
        ulCompetenza.appendChild(li);
    });


    profileCard.appendChild(ulCompetenza);


    let applyButton = document.createElement("button");
    applyButton.textContent = "Candidati";
    applyButton.classList.add("apply-button");
    profileCard.appendChild(applyButton);

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
    })
        .then(response => {
            //console.log(response);
            if (response.data) {
                //console.log(response.data);
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data : error.message);
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
                console.log(response.data.result);
                competenze[key] = response.data.result;
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.', response.data);
            }
        })
        .catch(error => {
            console.error("Errore di connessione:", error.response ? error.response.data.error : error.message);
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
                //console.log(competenzePerProfilo)
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data.error : error.message);
        });
}

function getProfiliByProgetto() {
    return axios.get("../backend/getProfiliByProgetto.php", {
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
            console.error("Access denied:", error.response ? error.response.data.error : error.message);
        });
}
function getRewards() {
    return axios.get("../backend/getRewards.php", {
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
                //console.log(response.data.result);
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            console.error("Errore nel recupero delle rewards:", error.response ? error.response.data.error : error.message);
        });
}

function getPictures() {
    return axios.get("../backend/getFotoByProgetto.php", {
        params: {
            progetto: projectName // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
        }
    })
        .then(response => {
            if (response.data.result.length !== 0) {
                //console.log(response.data.result); // Load the protected content
                pictures = response.data.result;
            } else {
                console.log("foto non disponibile per il progetto")
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data : error.message);
            //window.location.href = "login.html"; // Redirect if unauthorized
        });
}

function getComments() {
    return axios.get("../backend/getCommentsByProgetto.php", {
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
            console.error("Access denied:", error.response ? error.response.data.error : error.message);
        });
}
function getProject() {
    return axios.get("../backend/getProjectByName.php", {
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
                console.log(response.data.result);
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data.error : error.message);
        });
}

function showFormAddProfile() {
    popUpAggiungiProfilo.style.display = 'flex';  // Mostra il pop-up con display flex
    overlay.style.display = 'block';  // Mostra l'overlay
}

function closeFormAddProfile() {
    popUpAggiungiProfilo.style.display = 'none';  // Nasconde il pop-up
    overlay.style.display = 'none';  // Nasconde l'overlay
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
                    console.log(response.data); // Load the protected content
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
                    console.error("Access denied:", error.response ? error.response.data : error.message);
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
                    console.log(response.data); // Load the protected content
                })
                .catch(error => {
                    console.error("Access denied:", error.response ? error.response.data : error.message);
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


    let applyButton = document.createElement("button");
    applyButton.textContent = "Candidati";
    applyButton.classList.add("apply-button");
    //associo il metodo per la candidatura al click del bottone
    applyButton.addEventListener('click', applyForProfile);

    profileCard.appendChild(applyButton);

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
    /*
    if(role == "creator" || role == "admin_creator"){
        buttonRispondi.style.display = "block";
    }
    */
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
    if (isUserLoggedIn()) {
        //verifico che il progetto non sia chiuso
        if (projectData.budget > projectData.totale_finanziato && today <= projectData.dataLimite) {
            //verifico che ci sia un utenete
            if (isUserLoggedIn) {
                //visualizzo l'interfaccia di finanziamento
                overlay.style.display = "block";
                popUpFinanzia.style.display = "flex";
                mailFinanziatore.innerText = mail;

                if (selectedReward !== "") {
                    let rewardDOMNodes = document.querySelectorAll(".reward");
                    rewardDOMNodes.forEach(reward => {
                        if (reward.querySelector("img")?.getAttribute("cod") == selectedReward) {
                            reward.classList.add("selected");
                        }
                    });
                }

            } else {
                alert("Devi essere loggato per poter finanziare il progetto");
                window.location.href = "./login.html";
            }
        } else {
            alert("Progetto non finanziabile, il progetto è chiuso perchè il budget è stato raggiunto o la data limite è scaduta");
        }
    } else {
        alert("Devi essere loggato per poter finanziare il progetto");
        window.location.href = "./login.html";
    }
}

function closeFinanziamento(event) {
    // Pulisce i campi dell'interfaccia
    document.getElementById('importo').value = "";
    setUnselect(event, ".reward");
    selectedReward = "";
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

    if (mail == null || projectName == null || importo == null || mail == "" || projectName == "" || importo == "") {
        alert("Errore nei dati inseriti");
        return;
    }

    if (importo > projectData.budget - projectData.totale_finanziato) {
        alert("Importo superiore al budget rimanente, finanziato solo il budget rimanente");
        importo = projectData.budget - projectData.totale_finanziato;

        //chiudere il progetto
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
                console.log(response.data.result);
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
            console.error("Access denied:", error.response ? error.response.data.error : error.message);
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

async function displaySelectFinanziamento(event) {
    if (selectedReward !== "") {
        if (isUserLoggedIn()) {
            //visualizzo il popUp
            overlay.style.display = "block";
            popUpSelectFinanziamento.style.display = "flex";

            //scarico i dati dei finanziamenti dell'utente che non hanno una reward associata
            await getFinanziamentiByMail();

            //visualizzo i finanziamenti dell'utente
            displayFinanziamenti();
        } else {
            alert("Devi essere loggato per poter selezionare un finanziamento");
            window.location.href = "./login.html";
        }
    } else {
        alert("Seleziona una reward per poter procedere con la selezione del finanziamento");
    }
}

function closeSelectFinanziamento(event) {
    // Nasconde l'interfaccia di selezione del finanziamento
    overlay.style.display = "none";
    popUpSelectFinanziamento.style.display = "none";

    // Pulisce i campi dell'interfaccia
    setUnselect(event, ".finanziamento");
    selectedFinanziamento = "";
}

async function getFinanziamentiByMail() {
    try {
        await axios.get("../backend/getFinanziamentiByUtente.php", {
            params: {
                mail: mail // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        })
            .then(response => {
                if (response.data.result) {
                    finanziamentiUtente = response.data.result;
                    console.log(response.data.result);
                } else if (response.data.error) {
                    console.error(response.data.error);
                } else {
                    console.error('Risposta non corretta dal server.', response.data);
                }
            })
            .catch(error => {
                console.error("Errore nel recupero delle rewards:", error.response ? error.response.data.error : error.message);
                alert("Errore nel recupero dei finanziamenti");
            });
    } catch (error) {
        console.error('Errore nel caricamento delle rewards:', error);
        alert("Errore nel caricamento dei finanziamenti");
    }
}

function displayFinanziamenti() {
    //cleaning the finanziamenti container
    finanziamentoViewer.innerHTML = "";

    //read all finanziamenti and append them to the container
    finanziamentiUtente.forEach(finanziamento => {
        let finanziamentoNode = document.createElement("div");
        finanziamentoNode.className = "finanziamento";
        finanziamentoNode.setAttribute("tabindex", "0");
        finanziamentoNode.innerHTML = `
                                <p>mail: ${finanziamento.mail}</p>
                                <p>nome progetto: ${finanziamento.nome}</p>
                                <p>data: ${finanziamento.dataF}</p>
                                <p>importo: ${finanziamento.importo}</p>
                            `;

        finanziamentoNode.addEventListener("click", selectFinanziamento);
        finanziamentoViewer.appendChild(finanziamentoNode);
    });

}

function selectFinanziamento(event) {
    setUnselect(event, ".finanziamento");

    let targetNode = event.target.closest(".finanziamento");
    targetNode.classList.add("selected");
    let indexSelected = [...targetNode.parentNode.children].indexOf(targetNode);
    selectedFinanziamento = finanziamentiUtente[indexSelected]
}

function associateRewardToFinanziamento(event) {
    if (selectedFinanziamento != "") {
        // Prepara i dati da inviare al server
        const data = {
            mail: selectedFinanziamento.mail,
            nomeProgetto: selectedFinanziamento.nome,
            dataFinanziamento: selectedFinanziamento.dataF,
            codiceReward: selectedReward
        };

        axios.put("../backend/chooseReward.php", data, {
            headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
        })
            .then(response => {
                if (response.data) {
                    if (response.data.result) {
                        console.log(response.data); // Load the protected content
                        //aggiorno l'interfaccia
                        closeSelectFinanziamento(event);
                        alert("Reward associata con successo al finanziamento");
                    } else {
                        console.error(response.data);
                        alert("Errore nell'associazione della reward al finanziamento");
                    }
                } else {
                    console.error('Risposta non corretta dal server.');
                    alert("Errore nell'associazione della reward al finanziamento");
                }
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data : error.message);
                alert("Errore nell'associazione della reward al finanziamento");
            });
    } else {
        alert("Seleziona un finanziamento per poter procedere con l'associazione");
    }
}

async function applyForProfile(event) {
    if (isUserLoggedIn()) {
        mail = getUsernameFromToken();

        //controlloo che non sia null undefined o false per via di getUsernameFromToken
        if (!mail) {
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
        if (competenze.competenzeUser.some(r => competenzeProfileMapped.some(e => e.competenza === r.competenza && e.livello <= r.livello))) {
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
            if (response.data.result) {
                //console.log(response.data);
                alert("Candidatura inviata con successo");
            } else if (response.data.error) {
                console.error(response.data.error);
                alert("Errore nell'invio della candidatura");
            } else {
                console.error('Risposta non corretta dal server.');
                alert("Errore nell'invio della candidatura");
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data : error.message);
            alert("Errore nell'invio della candidatura");
        });
}
