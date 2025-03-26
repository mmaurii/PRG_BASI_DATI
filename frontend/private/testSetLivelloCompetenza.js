document.addEventListener('DOMContentLoaded', function () {
    btnTest = document.getElementById("test");
    btnTest.addEventListener('click', test);
});

function test(event) {
    // Access to the backend securely
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        window.location.href = "login.html"; // Redirect if no token
    } else {
        // Prepara i dati da inviare al server
        //codice reward can be null
        const data = {
            mail: "anna.verdi@email.com",
            livello: "3",
            competenza: "Gestione Progetti",
        };

        axios.post("../../backend/setLivelloCompetenza.php", data, {
            headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
        })
            .then(response => {
                if (response.data) {
                    console.log(response.data);
                } else {
                    console.error('Risposta non corretta dal server.');
                }
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data.error : error.message);
            });
    }
}
