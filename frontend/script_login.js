let mailField, passwordField, pErrorMsg, codSicurezzaField, accountTypeRadios;

document.addEventListener('DOMContentLoaded', () => {
    pErrorMsg = document.getElementById("errorMsg");
    mailField = document.getElementById('mail');
    passwordField = document.getElementById('password');
    codSicurezzaField = document.getElementById('codSicurezza');
    accountTypeRadios = document.getElementsByName('accountType');
    let adminCodeField = document.getElementById('adminCodeField');
    let btnLogin = document.getElementById('login');

    // Controlla quando cambia il tipo di account
    accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (document.querySelector('input[name="accountType"]:checked').value === 'admin') {
                adminCodeField.style.display = 'block';
            } else {
                adminCodeField.style.display = 'none';
            }
        });
    });

    btnLogin.addEventListener('click', login);
});

// Aggiungi un event listener al pulsante di login
async function login(event) {
    event.preventDefault();
    pErrorMsg.innerText = "";

    const username = mailField.value.trim();
    const password = passwordField.value;
    const accountType = document.querySelector('input[name="accountType"]:checked').value;
    const codSicurezza = codSicurezzaField.value.trim();

    if (!validate(username, password, accountType, codSicurezza)) {
        return;
    }

        const hashedPassword = password;

        let loginData = {
            mail: username,
            password: hashedPassword,
        };

        let loginUrl = '../backend/login.php';

        if (accountType === 'admin') {
            loginData.codSicurezza = codSicurezza;
            loginUrl = '../backend/loginAdmin.php';
        }

//        loginData = JSON.stringify(loginData);
        await axios.post(loginUrl, loginData, {
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
        }).then((result) => {
            if (result.data.token) {
                localStorage.setItem('jwtToken', JSON.stringify(result));
                console.log(JSON.stringify(result));

                window.location.href = './index.html';
            } else {
                pErrorMsg.innerText = 'Login failed.';
            }

            mailField.value = '';
            passwordField.value = '';
            codSicurezzaField.value = '';
        }).catch((err) => {
            let resp = err.response.data;
            pErrorMsg.innerText = resp.error;
        });

/*         const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(loginData),
        });

        if (response.ok) {
            const result = await response.json();

            if (result.token) {
                localStorage.setItem('jwtToken', JSON.stringify(result));
                console.log(JSON.stringify(result));

                window.location.href = './index.html';
            } else {
                pErrorMsg.innerText = result.error || 'Login failed.';
            }

            mailField.value = '';
            passwordField.value = '';
            codSicurezzaField.value = '';
        } else {
            let resp = JSON.parse(await response.text());
            pErrorMsg.innerText = resp.error;
        }
 */    
}


// Funzione per effettuare l'hashing della password
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
}

// Funzione per convertire un ArrayBuffer in una stringa esadecimale
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function validate(username, password, accountType, codSicurezza) {
    if (!username || !password) {
        pErrorMsg.innerText = 'Inserisci sia la mail che la password.';
        return false;
    }

    if (password.length < 5) {
        pErrorMsg.innerText = 'La password deve contenere almeno 5 caratteri.';
        return false;
    }

    if (accountType === 'admin' && !codSicurezza) {
        pErrorMsg.innerText = 'Il codice di sicurezza è obbligatorio per gli amministratori.';
        return false;
    }

    return true;
}