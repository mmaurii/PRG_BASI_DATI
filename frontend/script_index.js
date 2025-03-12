

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login').addEventListener('click', login);
    document.getElementById('logout').addEventListener('click', logout);
});

function login(){
    window.location.href = './login.html'; // Reindirizza a una nuova pagina
}

function logout(){
    localStorage.removeItem("jwtToken"); // Remove the token
}