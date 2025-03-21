document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("btn").addEventListener("click", function () {
        // Access to the backend securely
    const token = localStorage.getItem("jwtToken");
    console.log(token)
    if (!token) {
        window.location.href = "login.html"; // Redirect if no token
    } else {
        // Decodifica il token JWT per vedere il payload
        function decodeJWT(token) {
            const base64Url = token.split('.')[1]; // Prende solo il payload (seconda parte)
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Converte Base64URL in Base64
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));

            return JSON.parse(jsonPayload);
        }

        try {
            const decodedPayload = decodeJWT(token);
            console.log("Payload decodificato:", decodedPayload);
        } catch (error) {
            console.error("Errore nella decodifica del token:", error);
        }
        /*
        // Prepara i dati da inviare al server
        const data = {
            nomeUtente: "anna.verdi@email.com",
            idProfilo: "3",
            statoCandidatura: "accettata"
        };

        axios.put("http://localhost/prg_basi_dati/backend/manageApplicationStatus.php", data, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => {
                console.log(response.data); // Load the protected content
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data : error.message);
                //window.location.href = "login.html"; // Redirect if unauthorized
            });
        */
    }
    });

    
});