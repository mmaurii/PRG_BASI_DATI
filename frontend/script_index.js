let progetti, picture;
let btnLogin, btnLogout, projectContainer;
const token = localStorage.getItem("jwtToken");

document.addEventListener('DOMContentLoaded', function() {
    btnLogin = document.getElementById('login');
    btnLogout = document.getElementById('logout');
    projectContainer = document.getElementById('projectContainer');

    btnLogout.addEventListener('click', logout);
    btnLogin.addEventListener('click', login);

    initInterface();
});

async function initInterface(){
    await getProgetti();

    for (let element of this.progetti) {
        await getFotoProgetto(element);

        const boilerplate = `<a href="./progetto.html?name=${element.nome}" class="card">
                            <img src="data:image/png;base64,${picture}" alt="">
                            <h3>${element.nome}</h3>
                            <p>${element.descrizione}</p>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${Math.floor((element.totale_finanziato/element.budget)*100)}%;"></div>
                            </div>
                            <p>${Math.floor((element.totale_finanziato/element.budget)*100)}% finanziato - €${element.totale_finanziato} raccolti</p>
                        </a>`;

        projectContainer.innerHTML += boilerplate;
    }
}
async function getFotoProgetto(element){
    await axios.get("http://localhost/prg_basi_dati/backend/getFotoByProgetto.php", {
        params: {
            progetto: element.nome // Parametri della query string
        },
        headers: {
            "Authorization": `Bearer ${token}` // Header Authorization
        }
    })
        .then(response => {
            if(response.data.result.length !== 0){
            //console.log(response.data.result); // Load the protected content
            picture = response.data.result[0].foto
            }else{
                //console.log(response.data)
                picture = "";
            }
        })
        .catch(error => {
            console.error("Access denied:", error.response ? error.response.data : error.message);
            //window.location.href = "login.html"; // Redirect if unauthorized
        });
}
async function getProgetti(){
    await axios.get("../backend/getProgetti.php",{
        headers: {
            "Authorization": `Bearer ${token}` // Header Authorization
        }})
        .then(response => {
            if (response.data.result) {
                this.progetti = response.data.result;
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

function login(){
    window.location.href = './login.html'; // Reindirizza a una nuova pagina
}

function logout(){
    localStorage.removeItem("jwtToken"); // Remove the token
}