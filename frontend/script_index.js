import { isUserLoggedIn, getUsernameFromToken } from './script_navbar.js';

let projectContainer, progetti;
let token = JSON.parse(localStorage.getItem("jwtToken"));

document.addEventListener('DOMContentLoaded', function() {
    projectContainer = document.getElementById('projectContainer');
    initInterface();
});

async function initInterface() {
    await getProgetti(); // Recupera i progetti

    let htmlContent = progetti.map(element => `
        <a href="./progetto.html?name=${element.nome}" class="card" data-nome="${element.nome}">
            <img src="loading.jpg" data-src="" alt="" loading="lazy">
            <h3>${element.nome}</h3>
            <p>${element.descrizione}</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${Math.floor((element.totale_finanziato / element.budget) * 100)}%;"></div>
            </div>
            <p>${Math.floor((element.totale_finanziato / element.budget) * 100)}% finanziato - €${element.totale_finanziato} raccolti</p>
        </a>`).join("");

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
        const response = await axios.get("../backend/getProgetti.php", {
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        });

        if (response.data.result) {
            progetti = response.data.result;
            console.log(response.data.result);
        } else if (response.data.error) {
            console.error(response.data.error);
        } else {
            console.error('Risposta non corretta dal server.');
        }
    } catch (error) {
        console.error("Errore nel recupero dei progetti:", error.response ? error.response.data.error : error.message);
    }
}