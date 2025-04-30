import { isUserLoggedIn, getUsernameFromToken } from './script_navbar.js';

let projectContainer, progetti;
let token = JSON.parse(localStorage.getItem("jwtToken"));

document.addEventListener('DOMContentLoaded', function() {
    projectContainer = document.getElementById('projectContainer');
    initInterface();
    getClassificaAff();
    getClassificaFinanziatori();
});

async function initInterface() {
    await getProgetti();

    let htmlContent = progetti.map((element) => {
        let totale_finanziato = element.budget - (element.differenza_budget);
        return `<a href="./progetto.html?name=${element.nome}" class="card" data-nome="${element.nome}">
            <img src="loading.jpg" data-src="" alt="" loading="lazy">
            <h3>${element.nome}</h3>
            <p>${element.descrizione}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${Math.floor((totale_finanziato / element.budget) * 100)}%;"></div>
            </div>
            <p>${Math.floor((totale_finanziato / element.budget) * 100)}% finanziato - €${totale_finanziato} raccolti</p>
        </a>`}).join("");

    projectContainer.innerHTML = htmlContent;

    const fotoProgetti = await getFotoProgetti(progetti);

    document.querySelectorAll(".card").forEach((card, index) => {
        const nome = progetti[index].nome;
        let foto = fotoProgetti[nome]?.[0]?.foto || "";
        
        const img = card.querySelector("img");
        if (img && foto) img.src = foto;
    });
}

async function getFotoProgetti(progetti) {
    try {
        const nomiProgetti = progetti.map(p => p.nome);

        const response = await axios.get("../backend/getFotoByProgetto.php", {
            params: {
                progetti: nomiProgetti
            },
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}`
            }
        });

        return response.data.result;

    } catch (error) {
        console.error("Errore nel recupero delle foto:", error.response ? error.response.data : error.message);
        return {};
    }
}

async function getProgetti() {
    try {
        const response = await axios.get("../backend/getProgettiEvidenza.php", {
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        });

        if (response.data.result) {
            progetti = response.data.result;
        } else if (response.data.error) {
            console.error(response.data.error);
        } else {
            console.error('Risposta non corretta dal server.');
        }
    } catch (error) {
        console.error("Errore nel recupero dei progetti:", error.response ? error.response.data.error : error.message);
    }
}

function getClassificaAff() {
    axios.get('../backend/getClassificaAff.php')
        .then(response => {
            if (response.data.result && response.data.result.length > 0) {
                const classificaContainer = document.getElementById('classificaCreatori');
                
                const ul = document.createElement('ul');
                
                response.data.result.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.nickname;
                    ul.appendChild(li);
                });

                classificaContainer.appendChild(ul);
            } else {
                const classificaContainer = document.getElementById('classificaCreatori');
                classificaContainer.innerHTML = '<p>Nessun utente trovato.</p>';
            }
        })
        .catch(error => {
            console.error("Errore nel recupero dei progetti:", error.response ? error.response.data.error : error.message);
        });
}

function getClassificaFinanziatori() {
    axios.get('../backend/getClassificaFinanziatori.php')
        .then(response => {
            if (response.data.result && response.data.result.length > 0) {
                const classificaContainer = document.getElementById('classificaFinanziatori');
                
                const ul = document.createElement('ul');
                
                response.data.result.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.nickname;
                    ul.appendChild(li);
                });

                classificaContainer.appendChild(ul);
            } else {
                const classificaContainer = document.getElementById('classificaFinanziatori');
                classificaContainer.innerHTML = '<p>Nessun utente trovato.</p>';
            }
        })
        .catch(error => {
            console.error("Errore nel recupero dei progetti:", error.response ? error.response.data.error : error.message);
        });
}
