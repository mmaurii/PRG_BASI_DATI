let projectName, username, projectData, comments, role, pictures;
const token = localStorage.getItem("jwtToken");

const currentDate = new Date();
let mysqlDate = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

document.addEventListener('DOMContentLoaded', async function () {
    await initInterface();
    
    document.getElementById('login').addEventListener('click', login);
    document.getElementById('logout').addEventListener('click', logout);
    document.querySelector('.submit-comment').addEventListener('click', sendComment);
    
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
})

async function initInterface(){
    try {
        const params = new URLSearchParams(window.location.search);
        projectName = params.get('name');
        if(token){
            username = getUsernameFromToken(token);
            role = getRoleFromToken(token);
        }
        
        await getProject();
    
        let giorniRimasti = getGiorniRimasti(mysqlDate,projectData.dataLimite);
        document.title = projectName;
        document.querySelector(".project-title").innerText = projectName;
        document.querySelector(".subtitle").innerText = projectData.descrizione;
        document.querySelector("#creator-name").innerText = projectData.mailC;
        document.querySelector("#days-left").innerText = giorniRimasti;
        document.querySelector("#amount").innerText = projectData.totale_finanziato;
        document.querySelector("#budget").innerText = "raccolti di " + projectData.budget;
        document.querySelector("#percentuale").innerText = Math.floor((projectData.totale_finanziato/projectData.budget)*100) + "%";
        document.querySelector(".progress").style.width = Math.floor((projectData.totale_finanziato / projectData.budget) * 100) + "%";

        await getPictures();
        pictures.forEach(element => {
            let image = document.createElement("img")
            document.querySelector(".project-images").appendChild(image)
            image.src = "data:image/png;base64,"+element.foto;
        });
        

        await getComments();

        comments.forEach(element => {
            templateComment(element.testo,element.data,element.mail, element.id)
        });

        console.log('Progetto caricato con successo');
    } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
    }

}

async function getPictures(){
    await axios.get("../backend/getFotoByProgetto.php", {
        params: {
            progetto: projectName // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${token}` // Header Authorization
        }
    })
        .then(response => {
            if(response.data.result.length !== 0){
            //console.log(response.data.result); // Load the protected content
            pictures = response.data.result;
            }else{
                console.log("foto non disponibile per il progetto")
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data : error.message);
            //window.location.href = "login.html"; // Redirect if unauthorized
        });
}

async function getComments(){
    await axios.get("../backend/GetCommentsByProgetto.php", {
        params: {
            progetto: projectName // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${token}` // Header Authorization
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
async function getProject(){
        await axios.get("../backend/getProjectByName.php", {
            params: {
                progetto: projectName // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${token}` // Header Authorization
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
function showReplyForm(button){
    var replyForm = button.nextElementSibling;
    replyForm.firstElementChild.value = "";

    if(replyForm.style.display == "block"){
        replyForm.style.display = "none";
    }
    else{
        replyForm.style.display = "block";
    }
    // Nasconde altri moduli di risposta aperti
    var allReplyForms = document.querySelectorAll(".reply-form");
    allReplyForms.forEach(function(form) {
        if (form !== replyForm) {
            form.style.display = "none";
        }
    });
}
function sendReply(text,idComment, divReply, btnReply){
    if(text.value){
        if (!token) {
            window.location.href = "login.html"; // Redirect if no token
        } else {
            // Prepara i dati da inviare al server
            const data = {
                id: idComment,
                risposta: text.value,
            };

            axios.put("../backend/addResponseToComment.php", data, {
                headers: { "Authorization": `Bearer ${token}` }
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

function sendComment(){
    let text = document.querySelector("#textComment").value;
    if(text){
        if (!token) {
            window.location.href = "login.html"; // Redirect if no token
        } else {
            // Prepara i dati da inviare al server
            const data = {
                mail: username,
                nomeProgetto: projectName,
                testo: text,
                data: mysqlDate
            };

            axios.post("../backend/addComment.php", data, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(response => {
                    templateComment(text,mysqlDate,username,response.data.comment_id);
                    console.log(response.data); // Load the protected content
                })
                .catch(error => {
                    console.error("Access denied:", error.response ? error.response.data : error.message);
                });
        }
    }
    document.querySelector("#textComment").value = ""
}

function logout(){
    localStorage.removeItem("jwtToken"); // Remove the token
    location.reload();
}

function login(){
    window.location.href = './login.html'; // Reindirizza a una nuova pagina
}

function templateComment(text,mysqlDate,creatore,id){
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
    let data = document.createTextNode(" "+mysqlDate)
    
    autore.innerHTML = "<strong>"+ creatore +"</strong>"
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
    if (username === projectData.mailC) {  // Controlla se l'utente è il creatore del progetto
        buttonRispondi.style.display = "block";
    }    
    buttonRispondi.innerText = "Rispondi"
    divReplaySection.appendChild(buttonRispondi)

    let divForm = document.createElement("div")
    divForm.classList.add("reply-form")
    divReplaySection.appendChild(divForm)

    //verifica se il commento ha risposta
    let comment = comments.find(c => c.id === id);
    if(comment && comment.risposta){    //se chiamato da init comment è true in quanto dentro allla lista comments e si poi si verifica se ha la risposta, se invece chiamato da addComment sicuro non avrà risposta e sicuro non sarà dentro alla lista
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

    buttonRispondi.addEventListener('click', function() {
        showReplyForm(buttonRispondi);
    });
    buttonInvia.addEventListener('click', function() {
        sendReply(textRisposta,id,divForm,buttonRispondi);
    });
    
}

function getUsernameFromToken(token) {
    try {
        const payloadBase64 = token.split('.')[1]; // Estrae la parte payload del JWT
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodifica da Base64 a JSON
        return payloadDecoded.username || null; // Restituisce lo username
    } catch (error) {
        console.error("Errore nella decodifica del token:", error);
        return null;
    }
}
function getRoleFromToken(token) {
    try {
        const payloadBase64 = token.split('.')[1]; // Estrae la parte payload del JWT
        const payloadDecoded = JSON.parse(atob(payloadBase64)); // Decodifica da Base64 a JSON
        return payloadDecoded.ruolo || null; // Restituisce lo username
    } catch (error) {
        console.error("Errore nella decodifica del token:", error);
        return null;
    }
}
function getGiorniRimasti(dataCorrente, dataLimite) {
    const dataOggi = new Date(dataCorrente);
    const dataScadenza = new Date(dataLimite);

    // Calcola la differenza in millisecondi
    const differenzaMs = dataScadenza - dataOggi;

    // Calcola il numero di giorni
    const giorni = Math.floor(differenzaMs / (1000 * 60 * 60 * 24));

    return giorni;  // Restituisce la differenza in giorni
}