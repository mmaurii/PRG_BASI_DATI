let progetti;
let btnLogin, btnLogout, projectContainer;

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

    this.progetti.forEach(element => {
        const boilerplate = `<a href="./progetto.html?name=${element.nome}" class="card">
                        <img src="" alt="">
                        <h3>${element.nome}</h3>
                        <p>${element.descrizione}</p>
                        <div class="progress-bar">
                            <div class="progress" style="width: 75%;"></div>
                        </div>
                        <p>75% finanziato - €7,500 raccolti</p>
                    </a>`;

        projectContainer.innerHTML += boilerplate;
    });
}

async function getProgetti(){
    await axios.get("../backend/getProgetti.php")
        .then(response => {
            if (response.data.result) {
                this.progetti = response.data.result;
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