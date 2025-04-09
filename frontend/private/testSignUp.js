document.addEventListener('DOMContentLoaded', function () {
    btnTest = document.getElementById("test");
    btnTest.addEventListener('click', test);
});

function test(event) {
    // Access to the backend securely
    const token = localStorage.getItem("jwtToken");

    // Prepara i dati da inviare al server
    //codice reward can be null
    const data = {
        mail: "marco.bermuda@email.com",
        name: "Marco",
        surname: "Bermuda",
        nickname: "bermuda",
        anno : "1999",
        luogo : "Milano",
        password: "password",
    };

    axios.post("../../backend/signUp.php", data)
        .then(response => {
            if (response.data.result) {
                console.log(response.data.result);
                if(response.data.result === 1){
                    console.log("Registrazione avvenuta con successo.");
                    window.location.href = "./index.html";
                }else{
                    console.error("Errore nella registrazione, account non creato.");
                }
            } else if (response.data.error) {
                console.error(response.data.error);
            } else {
                console.error('Risposta non corretta dal server.');
            }
    })
        .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
    });

}
