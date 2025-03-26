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
            nomeProgetto: "Drone Fotografico",
            dataFinanziamento: "2025-03-17",
            importoFinanziamento: 5000,
            codiceReward: null,
        };

        axios.post("../../backend/finanziaProgetto.php", data, {
            headers: { "Authorization": `Bearer ${JSON.stringify(token)}` }
        })
            .then(response => {
                if (response.data.result) {
                    console.log(response.data.result);
                } else if (response.data.error) {
                    console.error(response.data.error);
                } else {
                    console.error('Risposta non corretta dal server.');
                }
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data.error : error.message);
                //window.location.href = "login.html"; // Redirect if unauthorized
            });
    }
}
