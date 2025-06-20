import { isUserLoggedIn, getRoleFromToken, getUsernameFromToken } from "./script_navbar.js";

document.addEventListener('DOMContentLoaded', function () {
    fetchCompetenze();
    document.getElementById('addCompetenceForm').addEventListener('submit', addCompetence);
});

function logout() {
    localStorage.removeItem("jwtToken"); // Rimuove il token
    window.location.href = './login.html'; // Redirige alla pagina di login
}

// Funzione per ottenere le competenze
async function fetchCompetenze() {
    try {
        // Effettua la richiesta GET per ottenere le competenze
        const response = await axios.get("../backend/getCompetenze.php", {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });
        
        if (response.data.result) {
            popolaLista(response.data.result);
        } else {
            console.error("Errore durante il recupero delle competenze.");
        }
    } catch (error) {
        console.error("Errore di connessione:", error.response ? error.response.data.error : error.message);
    }
}

// Funzione per popolare la lista delle competenze
function popolaLista(competencies) {
    const competenceList = document.getElementById('competenceList');
    competenceList.innerHTML = '';

    if (competencies.length > 0) {
        competencies.forEach(competenza => {
            const listItem = document.createElement('li');
            listItem.classList.add('competence-item');
            listItem.innerHTML = `<h3>${competenza.competenza}</h3>`;
            competenceList.appendChild(listItem);
        });
    }
}

// Funzione per aggiungere una competenza
async function addCompetence(event) {
    event.preventDefault();
    const competenceName = document.getElementById('competenceName').value.trim();

    if (competenceName) {
        const data = { competenza: competenceName };

        // Effettua la richiesta POST per aggiungere la competenza
        await axios.post('../backend/addCompetenza.php', data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Header Authorization
            }
        }).then((result) => {
            alert(result.data.result);
            fetchCompetenze();
        }).catch((err) => {
            alert(err.response.data.error || "Errore durante l'aggiunta della competenza");
        });
    }
}