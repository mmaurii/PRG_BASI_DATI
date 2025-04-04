const rewardsData = [];


document.addEventListener("DOMContentLoaded", function () {

    const addRewardButton = document.getElementById('add-reward');
    const rewardsContainer = document.getElementById('rewards-container');
    const rewardsList = document.getElementById('rewards-list');
    
    // Funzione per aggiungere una ricompensa
    addRewardButton.addEventListener('click', function () {
        const rewardTitle = document.querySelector('input[name="reward-title[]"]').value;
        const rewardImage = document.querySelector('input[name="reward-image[]"]').files[0];

        // Verifica che il titolo e l'immagine siano stati inseriti
        if (!rewardTitle || !rewardImage) {
            alert("Compila tutti i campi della ricompensa!");
            return;
        }

        // Crea un nuovo item nella lista delle ricompense
        const rewardItem = document.createElement('li');
        rewardItem.classList.add('reward-item');

        // Mostra il titolo e l'immagine della ricompensa
        rewardItem.innerHTML = `
            <img src="${URL.createObjectURL(rewardImage)}" alt="${rewardTitle}" width="50" height="50">
            <p>${rewardTitle}</p>
        `;

        // Aggiungi la ricompensa alla lista
        rewardsList.appendChild(rewardItem);

        // Pulisce i campi per aggiungere nuove ricompense
        document.querySelector('input[name="reward-title[]"]').value = '';
        document.querySelector('input[name="reward-image[]"]').value = '';

        
        const nome = document.querySelector('#title').value;

        if (rewardImage) {
            const formData = new FormData();
            formData.append('file', rewardImage);
    
            // Effettua la richiesta POST per caricare l'immagine
            axios.post("http://13.61.196.206/uploadImage.php", formData)
                .then(response => {
                    if (response.data.success) {
                        // Ottieni il percorso dell'immagine dalla risposta
                        const imageUrl = response.data.imageUrl;
                        console.log(imageUrl);
                        rewardsData.push({
                            inputCod: rewardTitle,
                            inputFoto: imageUrl,
                            inputDescrizione: rewardTitle,
                            inputNomeP: nome
                        });
                    } else {
                        alert('Errore nel caricamento dell\'immagine: ' + response.data.error);
                    }
                })
                .catch(error => {
                    console.error('Errore nella richiesta di caricamento dell\'immagine:', error);
                    alert('Si è verificato un errore nel caricare l\'immagine.');
                });
        } else {
            alert('Devi caricare un\'immagine per il progetto.');
        }
    });
});

document.querySelector('.project-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impedisce il comportamento predefinito del form

    // Preleva i dati dal modulo
    const nome = document.querySelector('#title').value;
    const descrizione = document.querySelector('#short-description').value;
    const dataInserimento = new Date().toISOString().split('T')[0];
    const budget = document.querySelector('#goal').value;
    const dataLimite = document.querySelector('#end-date').value;
    const stato = 'aperto';
    const mailC = 'mario.rossi@email.com'; // Utente di prova
    const tipo = document.querySelector('#project-type').value;

    const imageFiles = Array.from(document.querySelector('#image').files);

    if (imageFiles.length === 0) {
        alert('Devi caricare almeno un\'immagine per il progetto.');
        return;
    }

    try {
        // Carica tutte le immagini
        const uploadPromises = imageFiles.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return axios.post("http://13.61.196.206/uploadImage.php", formData);
        });

        const uploadResponses = await Promise.all(uploadPromises);
        const imageUrls = uploadResponses.map(res => res.data.imageUrl);

        // Crea l'oggetto contenente i dati da inviare al server
        const projectData = {
            nome: nome,
            descrizione: descrizione,
            dataInserimento: dataInserimento,
            budget: budget,
            dataLimite: dataLimite,
            stato: stato,
            mailC: mailC,
            tipo: tipo,
            imageUrls: imageUrls
        };

        const response = await axios.post("../backend/addProgetto.php", projectData);

        if (response.data.success) {
            alert('Progetto creato con successo!');
        } else {
            alert('Errore: ' + response.data.error);
        }

        // Invia ogni ricompensa a addreward.php
        rewardsData.forEach(reward => {
            axios.post("../backend/addReward.php", {
                //codice: reward.inputCod,
                foto: reward.inputFoto,
                descrizione: reward.inputDescrizione,
                progetto: reward.inputNomeP
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log('Ricompensa aggiunta con successo:', response.data);
            })
            .catch(error => {
                console.error('Errore nell\'aggiunta della ricompensa:', error);
                alert('Errore nel salvataggio della ricompensa: ' + error.message);
            });
        });

        // Verifica se ci sono ricompense da inviare
        if (rewardsData.length === 0) {
            alert("Nessuna ricompensa da salvare!");
            return;
        }

    } catch (error) {
        console.error('Errore:', error);
        alert('Si è verificato un errore durante il caricamento.');
    }
});