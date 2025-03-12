document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("loginForm").addEventListener("submit", function (e) {
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
                console.error("Login error:", error.response ? error.response.data : error.message);
            });
    });

    // Access `a.php` securely
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        window.location.href = "login.html"; // Redirect if no token
    } else {
        axios.put("http://localhost/prg_basi_dati/backend/choseReward.php", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => {
                console.log(response.data); // Load the protected content
            })
            .catch(error => {
                console.error("Access denied:", error.response ? error.response.data : error.message);
                window.location.href = "login.html"; // Redirect if unauthorized
            });
    }
});
