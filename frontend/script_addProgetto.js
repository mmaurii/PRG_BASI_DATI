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
            <strong>${rewardTitle}</strong>
            
        `; //<img src="${URL.createObjectURL(rewardImage)}" alt="${rewardTitle}" width="50" height="50">

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


document.querySelector('.project-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impedisce il comportamento predefinito del form (invio della pagina)

    // Preleva i dati dal modulo
    const nome = document.querySelector('#title').value;
    const descrizione = document.querySelector('#short-description').value;
    const dataInserimento = new Date().toISOString().split('T')[0]; // Data odierna
    const budget = document.querySelector('#goal').value;
    const dataLimite = document.querySelector('#end-date').value;
    const stato = 'aperto'; // Default o puoi aggiungere un campo per questo
    const mailC = 'mario.rossi@email.com'; // Qui dovresti recuperare l'email del creatore
    const tipo = document.querySelector('#project-type').value; // Seleziona il valore dal <select>

    // Crea l'oggetto contenente i dati da inviare al server
    const projectData = {
        nome: nome,
        descrizione: descrizione,
        dataInserimento: dataInserimento,
        budget: budget,
        dataLimite: dataLimite,
        stato: stato,
        mailC: mailC,
        tipo: tipo
    };


    // Gestione del caricamento dell'immagine
    const imageFile = document.querySelector('#image').files[0];
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        // Effettua la richiesta POST per caricare l'immagine
        axios.post("http://13.61.196.206/uploadImage.php", formData)
            .then(response => {
                if (response.data.success) {
                    // Ottieni il percorso dell'immagine dalla risposta
                    const imageUrl = response.data.imageUrl;
                    console.log(imageUrl);

                    // Aggiungi l'URL dell'immagine ai dati del progetto
                    projectData.imageUrl = imageUrl;

                    // Ora invia i dati del progetto al server
                    axios.post("../backend/addProgetto.php", projectData)
                        .then(response => {
                            if (response.data.success) {
                                alert('Progetto inserito con successo!');
                                // Puoi fare altre operazioni dopo l'inserimento (es. resettare il modulo o reindirizzare)
                            } else {
                                alert('Errore: ' + response.data.error);
                            }
                        })
                        .catch(error => {
                            console.error('Errore nella richiesta del progetto:', error);
                            alert('Si è verificato un errore nell\'aggiungere il progetto.');
                        });
                } else {
                    alert('Errore nel caricamento dell\'immagine: ' + response.data.error);
                }

                // Invia ogni ricompensa a addreward.php
                rewardsData.forEach(reward => {
                    axios.post("../backend/addReward.php", {
                        codice: reward.inputCod,
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
            })
            .catch(error => {
                console.error('Errore nella richiesta di caricamento dell\'immagine:', error);
                alert('Si è verificato un errore nel caricare l\'immagine.');
            });
    } else {
        alert('Devi caricare un\'immagine per il progetto.');
    }

    // Verifica se ci sono ricompense da inviare
    if (rewardsData.length === 0) {
        alert("Nessuna ricompensa da salvare!");
        return;
    }
});
