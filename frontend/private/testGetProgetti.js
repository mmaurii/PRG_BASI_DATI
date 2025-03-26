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
        axios.get("../../backend/getProgetti.php", {
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
