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
            codiceReward: "",
        };

        axios.post("../../backend/finanziaProgetto.php", data, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => {
                console.log(response.data); // Load the protected content
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data : error.message);
                //window.location.href = "login.html"; // Redirect if unauthorized
            });
    }
}
