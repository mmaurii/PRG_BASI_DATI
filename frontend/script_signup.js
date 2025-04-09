// import {create} from "axios";
let mailField, passwordField, pErrorMsg, nameField, surnameField, cityField, 
   yearField, nicknameField, roleFields, secureCodeDiv, secureCodeField, role = "user";

document.addEventListener('DOMContentLoaded', () => {
   // Seleziona gli elementi dal DOM
   pErrorMsg = document.getElementById("errorMsg");
   mailField = document.getElementById('mail');
   passwordField = document.getElementById('password');
   nameField = document.getElementById('name');
   surnameField = document.getElementById('surname');
   cityField = document.getElementById('birthCity');
   yearField = document.getElementById('birthYear');
   nicknameField = document.getElementById('nickname');
   roleFields = document.getElementsByName('accountType');
   secureCodeDiv = document.getElementById('secureCodeDiv');
   secureCodeField = document.getElementById('secureCode');
   let btnCreateAccount = document.getElementById('signup');

   roleFields.forEach(i=>i.addEventListener('click', checkRole));
   btnCreateAccount.addEventListener('click', createAccount);
});

async function createAccount(event) {
   event.preventDefault();
   pErrorMsg.innerText = "";

   // Leggi i valori dei campi
   const mail = mailField.value.trim();
   const password = passwordField.value;
   const name = nameField.value;
   const surname = surnameField.value;
   const city = cityField.value;
   const year = yearField.value;
   const nickname = nicknameField.value;

   if (!validate(mail, password, year)) {
      return;
   }

   //verifico che non ci sia già un utente con lo stesso nome e ne creo uno nuovo
   try {
      const hashedPassword = await hashPassword(password);

      // Prepara i dati da inviare al server
      const registerData = {
         mail: mail,
         password: hashedPassword,
         name: name,
         surname: surname,
         city: city,
         year: year,
         nickname: nickname,
         role:role
      };

      if(role === "admin"){
         if(secureCodeField.value === ""){
            pErrorMsg.innerText = "Inserisci il codice di sicurezza.";
            return;
         }
         registerData.secureCode = secureCodeField.value;
      }

      await axios.post("../backend/signUp.php", registerData)
         .then(response => {
            if (response.data) {
               console.log(response.data.result);
               if (response.data.result === 1) {
                  console.log("Registrazione avvenuta con successo.");
                  window.location.href = "./index.html";
               } else if(response.data.result === 0){
                  pErrorMsg.innerText = "Esiste già un account associato a questa mail, usa un'altra mail.";
               } else if (response.data.error) {
                  console.error(response.data.error);
                  pErrorMsg.innerText = response.data.error;
               } else {
                  console.error('Risposta non corretta dal server.', response);
               }
            } else {
               console.error('Risposta non corretta dal server.', response);
            }
         })
         .catch(error => {
            let msg = error.response ? error.response.data : error.message;
            console.error("Access denied:", msg);
            alert(msg);
     });
   } catch (error) {
      console.error('Errore durante la registrazione:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
   }
}

function validateYear(year) {
   //limit of MYSQL type YEAR(4)
   const lowerBound = 1901;
   const upperBound = 2155;

   if (year !== "") {
      let today = new Date();
      if (year > today.getFullYear() || year < lowerBound || year > upperBound) {
         return false;
      }
   }
   return true;
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

function validate(mail, password, year) {
   // Controlla che i campi non siano vuoti
   if (!mail || !password) {
      pErrorMsg.innerText = 'Inserisci sia la mail che la password.';
      return false;
   }

   //check della mail
   const mailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
   if (!mailRegex.test(mail)) {
      pErrorMsg.innerText = 'la mail non è valida.';
      return false;
   }

   // Esegui una validazione base (esempio: lunghezza minima)
   if (password.length < 5) {
      pErrorMsg.innerText = 'La password deve contenere almeno 5 caratteri.';
      return false;
   }

   if (!validateYear(year)) {
      yearField.value = '';
      pErrorMsg.innerText = "l'anno di nascita non può essere nel futuro";
      return false;
   }
   return true;
}

function checkRole(event){
   if (event.target.value === 'admin'){
      role = "admin";
      secureCodeDiv.style.display = "block";
   } else if(event.target.value === 'user'){
      role = "user";
      secureCodeDiv.style.display = "none";
   } else if(event.target.value === 'creator'){
      role = "creator";
      secureCodeDiv.style.display = "none";
   }
}