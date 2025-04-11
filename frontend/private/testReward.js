document.addEventListener('DOMContentLoaded', function () {
    /* document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        axios.post("login.php", { email, password })
            .then(response => {
                if (response.data.token) {
                    localStorage.setItem("jwt", response.data.token); // Store JWT token
                    window.location.href = "a.php"; // Redirect to protected page
                } else {
                    alert("Login failed: " + response.data.error);
                }
            })
            .catch(error => {
                let msg = error.response ? error.response.data : error.message;
                console.error("Access denied:", msg);
                alert(msg);
            });
    }); */

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
        const data = {
            mail: "anna.verdi@email.com",
            nomeProgetto: "Drone Fotografico",
            dataFinanziamento: "2025-03-05",
            codiceReward: "3",
        };

        axios.put("../backend/choseReward.php", data, {
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
                let msg = error.response ? error.response.data : error.message;
                console.error("Access denied:", msg);
                alert(msg);
                //window.location.href = "login.html"; // Redirect if unauthorized
            });
    }
}    
