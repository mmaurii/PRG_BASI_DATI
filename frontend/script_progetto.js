document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login').addEventListener('click', login);
    document.getElementById('logout').addEventListener('click', logout);
    document.querySelector('.submit-comment').addEventListener('click', sendComment);

})
function sendComment(){
    let text = document.querySelector("#textArea").value;
    if(text){
        const token = localStorage.getItem("jwtToken");
        console.log(token)
        if (!token) {
            window.location.href = "login.html"; // Redirect if no token
        } else {
            let currentDate = new Date();
            let mysqlDate = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            // Prepara i dati da inviare al server
            const data = {
                mail: "luca.bianchi@email.com",
                nomeProgetto: "Smart Home Hub",
                testo: text,
                data: mysqlDate
            };

            axios.post("http://localhost/prg_basi_dati/backend/addComment.php", data, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(response => {
                    templateComment(text,mysqlDate);
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

var cont = 0;

function templateComment(text,mysqlDate){
    cont++;
    let container = document.querySelector(".comment-list")
    
    let li = document.createElement("li")
    li.classList.add("comment")
    container.appendChild(li)

    let div = document.createElement("div")
    div.classList.add("comment-user")
    li.appendChild(div)

    let img = document.createElement("img")
    let autore = document.createElement("p")
    autore.innerHTML = "<strong>"+"luca.bianchi@email.com "+"</strong>"
    let data = document.createTextNode(""+mysqlDate)
    
    autore.appendChild(data)
    div.appendChild(img)
    div.appendChild(autore)


    let textComment = document.createElement("p")
    textComment.innerText = text
    li.appendChild(textComment)
}