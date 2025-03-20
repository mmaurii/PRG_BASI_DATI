let projectName, username, projectData, comments;
const token = localStorage.getItem("jwtToken");

const currentDate = new Date();
let mysqlDate = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login').addEventListener('click', login);
    document.getElementById('logout').addEventListener('click', logout);
    document.querySelector('.submit-comment').addEventListener('click', sendComment);

    initInterface();

})

async function initInterface(){
    try {
        const params = new URLSearchParams(window.location.search);
        projectName = params.get('name');

        await getProject();
    
        let giorniRimasti = getGiorniRimasti(mysqlDate,projectData.dataLimite);
        document.title = projectName;
        document.querySelector(".project-title").innerText = projectName;
        document.querySelector(".subtitle").innerText = projectData.descrizione;
        document.querySelector("#creator-name").innerText = projectData.mailC;
        document.querySelector("#days-left").innerText = giorniRimasti;
        document.querySelector("#budget").innerText = "raccolti di " + projectData.budget;

        await getComments();

        comments.forEach(element => {
            templateComment(element.testo,element.data,element.mail)
        });

        console.log('Progetto caricato con successo');
    } catch (error) {
        console.error('Errore nel caricamento del progetto:', error);
    }

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

function sendComment(){
    let text = document.querySelector("#textArea").value;
    if(text){
        username = getUsernameFromToken(token);

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

            axios.post("http://localhost/prg_basi_dati/backend/addComment.php", data, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(response => {
                    templateComment(text,mysqlDate,username);
                    console.log(response.data); // Load the protected content
                })
                .catch(error => {
                    console.error("Access denied:", error.response ? error.response.data : error.message);
                });
        }
    }
    document.querySelector("#textArea").value = ""
}

function logout(){
    localStorage.removeItem("jwtToken"); // Remove the token
}

function login(){
    window.location.href = './login.html'; // Reindirizza a una nuova pagina
}

function templateComment(text,mysqlDate,creatore){
    let container = document.querySelector(".comment-list")
    
    let li = document.createElement("li")
    li.classList.add("comment")
    container.appendChild(li)

    let div = document.createElement("div")
    div.classList.add("comment-user")
    li.appendChild(div)

    let img = document.createElement("img")
    let autore = document.createElement("p")
    autore.innerHTML = "<strong>"+ creatore +"</strong>"
    let data = document.createTextNode(" "+mysqlDate)
    
    autore.appendChild(data)
    div.appendChild(img)
    div.appendChild(autore)


    let textComment = document.createElement("p")
    textComment.innerText = text
    li.appendChild(textComment)
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
function getGiorniRimasti(dataCorrente, dataLimite) {
    const dataOggi = new Date(dataCorrente);
    const dataScadenza = new Date(dataLimite);

    // Calcola la differenza in millisecondi
    const differenzaMs = dataScadenza - dataOggi;

    // Calcola il numero di giorni
    const giorni = Math.floor(differenzaMs / (1000 * 60 * 60 * 24));

    return giorni;  // Restituisce la differenza in giorni
}