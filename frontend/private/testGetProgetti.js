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
        _={};
        axios.post("../../backend/getProgetti.php",_, {
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
