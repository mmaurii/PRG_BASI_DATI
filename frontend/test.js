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
        
        // Prepara i dati da inviare al server
        const data = {
            progetto: "Smart Home Hub",
        };

        axios.get("http://localhost/prg_basi_dati/backend/getFotoByProgetto.php", {
            params: {
                progetto: "Smart Home Hub" // Parametri della query string
            },
            headers: {
                "Authorization": `Bearer ${token}` // Header Authorization
            }
        })
            .then(response => {
                console.log(response.data.result); // Load the protected content
                let imgElement = document.createElement("img");
            
                // Imposta il src dell'immagine con la stringa Base64 (assicurati di specificare il tipo di immagine, es. jpeg, png, ecc.)
                imgElement.src = "data:image/png;base64," + response.data.result[0].foto
                ; // Assicurati che il tipo di immagine (png, jpeg) sia corretto
                
                // Aggiungi l'immagine al body (o a un altro elemento del DOM)
                document.body.appendChild(imgElement);
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data : error.message);
                //window.location.href = "login.html"; // Redirect if unauthorized
            });
        
    }
    });

    
});