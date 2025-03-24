let progetti, picture, picturesArray;
let btnLogin, btnLogout, projectContainer, btnSignup;
const token = localStorage.getItem("jwtToken");

document.addEventListener('DOMContentLoaded', function() {
    btnLogin = document.getElementById('login');
    btnLogout = document.getElementById('logout');
    btnSignup = document.getElementById('signup');
    projectContainer = document.getElementById('projectContainer');

    btnLogout.addEventListener('click', logout);
    btnLogin.addEventListener('click', login);
    btnSignup.addEventListener('click', signup);

    initInterface();
});

async function initInterface() {
    await getProgetti(); // Recupera tutti i progetti

    // Crea un array di promesse per le foto dei progetti
    const fotoPromises = this.progetti.map(element => getFotoProgetto(element));

    // Aspetta che tutte le foto siano state recuperate in parallelo
    const fotoResults = await Promise.all(fotoPromises);        //fotoPromises è un array di promesse

    for (let i = 0; i < this.progetti.length; i++) {
        const element = this.progetti[i];
        const picture = fotoResults[i];  // La foto corrispondente per questo progetto

        // Crea l'HTML del progetto
        const boilerplate = `<a href="./progetto.html?name=${element.nome}" class="card">
                            <img src="${picture}" alt="">
                            <h3>${element.nome}</h3>
                            <p>${element.descrizione}</p>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${Math.floor((element.totale_finanziato / element.budget) * 100)}%;"></div>
                            </div>
                            <p>${Math.floor((element.totale_finanziato / element.budget) * 100)}% finanziato - €${element.totale_finanziato} raccolti</p>
                        </a>`;

        // Aggiungi il boilerplate al contenuto HTML accumulato
        projectContainer.innerHTML += boilerplate;
    }

    // Aggiungi il contenuto finale all'interno del container del progetto
    projectContainer.innerHTML = htmlContent;
}

async function getFotoProgetto(element) {
    try {
        const response = await axios.get("http://localhost/prg_basi_dati/backend/getFotoByProgetto.php", {
            params: {
                progetto: element.nome // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${token}` // Header Authorization
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
                "Authorization": `Bearer ${token}` // Header Authorization
            }
        });

        if (response.data.result) {
            this.progetti = response.data.result;
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


function login(){
    window.location.href = './login.html';
}

function logout(){
    localStorage.removeItem("jwtToken"); // Remove the token
}

function signup(){
    logout();
    window.location.href = './signup.html';
}