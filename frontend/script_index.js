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

    // Carica le immagini in background
    progetti.forEach(async (element, index) => {
        const picture = await getFotoProgetto(element);
        document.querySelectorAll(".card img")[index].src = picture;
    });
}

async function getFotoProgetto(element) {
    try {
        const response = await axios.get("../backend/getFotoByProgetto.php", {
            params: {
                progetto: element.nome // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${JSON.stringify(token)}` // Header Authorization
            }
        });

        console.log(response); // Per debugging

        if (response.data.result.length !== 0) {
            return response.data.result[0].foto;  // Restituisci l'URL della foto
        } else {
            return "";  // Se non c'è nessuna foto, restituisci una stringa vuota
        }
    } catch (error) {
        console.error("Errore nel recupero della foto:", error.response ? error.response.data : error.message);
        return "";  // In caso di errore, restituisci una stringa vuota
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