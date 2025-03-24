// import {create} from "axios";
let mailField, passwordField, pErrorMsg;

document.addEventListener('DOMContentLoaded', () => {
   // Seleziona gli elementi dal DOM
   pErrorMsg = document.getElementById("errorMsg");
   mailField = document.getElementById('mail');
   passwordField = document.getElementById('password');

   let btnLogin = document.getElementById('login');

   btnLogin.addEventListener('click', login);
});

// Aggiungi un event listener al pulsante di login
async function login(event) {
   event.preventDefault(); // Previene il comportamento predefinito del bottone
   pErrorMsg.innerText = "";

   // Leggi i valori dei campi
   const username = mailField.value.trim();
   const password = passwordField.value;

   if (!validate(username, password)) {
      return;
   }

   // Hash della password (utilizzando la libreria SubtleCrypto disponibile nei browser moderni)
   try {
//      const hashedPassword = await hashPassword(password);
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
         mailField.value = '';
         passwordField.value = '';
      } else {
         const msg = await response.text();
         pErrorMsg.innerText = msg;
      }
   } catch (error) {
      console.error('Errore durante il login:', error);
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

function validate(username, password) {
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