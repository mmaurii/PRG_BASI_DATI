// import {create} from "axios";
let usernameField, passwordField, pErrorMsg;

document.addEventListener('DOMContentLoaded', () => {
   // Seleziona gli elementi dal DOM
   pErrorMsg = document.getElementById("errorMsg");
   usernameField = document.getElementById('first');
   passwordField = document.getElementById('password');

   let btnLogin = document.getElementById('login');
   let btnCreateAccount = document.getElementById('createAccount');

   btnLogin.addEventListener('click', login);
   btnCreateAccount.addEventListener('click', createAccount);
});

async function createAccount(event) {
   event.preventDefault();
   pErrorMsg.innerText = "";

   // Leggi i valori dei campi
   const username = usernameField.value.trim();
   const password = passwordField.value;

   if (!validateData(username, password)) {
      return;
   }

   //verifico che non ci sia già un utente con lo stesso nome
   // Hash della password (utilizzando la libreria SubtleCrypto disponibile nei browser moderni)
   try {
/*       const hashedPassword = await hashPassword(password);
 */      const hashedPassword = password;

      // Prepara i dati da inviare al server
      const registerData = {
         username: username,
         password: hashedPassword, // Invia l'hash invece della password in chiaro
      };

      // Invia i dati al server tramite una richiesta POST
      const response = await fetch('http://localhost:3000/register', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(registerData)
      });

      // Gestisci la risposta del server
      if (response.ok) {
         alert('Account creato con successo! Puoi ora effettuare il login.');
         usernameField.value = '';
         passwordField.value = '';
      } else if (response.status === 400) {
         let msg = await response.text();
         pErrorMsg.innerText = msg;
      }

   } catch (error) {
      console.error('Errore durante la registrazione:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
   }
}

// Aggiungi un event listener al pulsante di login
async function login(event) {
   event.preventDefault(); // Previene il comportamento predefinito del bottone
   pErrorMsg.innerText = "";

   // Leggi i valori dei campi
   const username = usernameField.value.trim();
   const password = passwordField.value;

   if (!validateData(username, password)) {
      return;
   }

   // Hash della password (utilizzando la libreria SubtleCrypto disponibile nei browser moderni)
   try {
      const hashedPassword = password;

      // Prepara i dati da inviare al server
      const loginData = {
         mail: username,
         password: hashedPassword,
      };

      // Invia i dati al server tramite una richiesta POST
      const response = await fetch('../backend/login.php', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         credentials: 'include',
         body: JSON.stringify(loginData),
      });

      // Verifica se la risposta è corretta (status 200-299)
      if (response.ok) {
         const result = await response.json(); // Risponde con un oggetto JSON

         // Gestione del login
         if (result.token) {
            localStorage.setItem('jwtToken', JSON.stringify(result));
            console.log(JSON.stringify(result));

            // Reindirizza a una nuova pagina
            window.location.href = './index.html';
         } else if (result.error) {
            pErrorMsg.innerText = result.error;
         } else {
            pErrorMsg.innerText = 'Risposta non corretta dal server.';
         }

         // Pulisce i campi di input
         usernameField.value = '';
         passwordField.value = '';
      } else {
         const msg = await response.text();
         pErrorMsg.innerText = msg;
      }
   } catch (error) {
      console.error('Errore durante il login:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
   }

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

function validateData(username, password) {
   // Controlla che i campi non siano vuoti
   if (!username || !password) {
      pErrorMsg.innerText = 'Inserisci sia il nome utente che la password.';
      return false;
   }

   // Esegui una validazione base (esempio: lunghezza minima)
   if (password.length < 5) {
      pErrorMsg.innerText = 'La password deve contenere almeno 5 caratteri.';
      return false;
   }
   return true;
}