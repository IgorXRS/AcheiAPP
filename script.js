
var firebaseConfig = {
    apiKey: "AIzaSyBVLzhwMaV5cSvVtegKw8XM-ZBD6EnaE8g",
    authDomain: "achei-devix.firebaseapp.com",
    projectId: "achei-devix",
    storageBucket: "achei-devix.appspot.com",
    messagingSenderId: "403722412524",
    appId: "1:403722412524:web:a7b94e5cef25eacad0e0c9"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


const storage = firebase.storage();
const db = firebase.firestore();



document.addEventListener('DOMContentLoaded', async function() {

    

    // Carrega os IDs de dispositivos existentes do Firebase
    const db = firebase.firestore();




    //-----------------------------------------------------------------------------------------------------
    


    //-----------------------------------------------------------------------------------------------------



    //-----------------------------------------------------------------------------------------------------
    // Seletor do formulário de cadastro de votação
    const formVotacao = document.querySelector('#form-votacao');

    // Seletor do botão para adicionar candidato
    const btnAdicionarCandidato = document.querySelector('#adicionarCandidato');

    // Event listener para o botão de adicionar candidato
    btnAdicionarCandidato.addEventListener('click', (event) => {
        event.preventDefault();
        
    // Obter valores dos campos do candidato
    const nomeCandidato = document.querySelector('#nomeCandidato').value;
    const foto1URL = document.querySelector('#foto1Candidato').files[0];
    
    // Verificar se todos os campos obrigatórios estão preenchidos
    if (!nomeCandidato || !foto1URL) {
        alert('Por favor, preencha todos os campos obrigatórios do candidato.');
        return;
    }

    // Criar novo elemento para o candidato
    const novoCandidato = document.createElement('li');
    novoCandidato.innerHTML = `
        <span>${nomeCandidato}</span>
        <img src="${URL.createObjectURL(foto1URL)}" alt="Foto 1">
    `;
    
    // Adicionar o novo candidato à lista de candidatos
    document.querySelector('#listaCandidatos').appendChild(novoCandidato);
    
    });

// Event listener para o envio do formulário de cadastro
formVotacao.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    document.getElementById("loadingOverlay").style.display = "block";
    
    // Obter valores dos campos
    const nomeVotacao = document.querySelector('#nomeVotacao').value;
    const descricaoVotacao = document.querySelector('#descricaoVotacao').value;
    const autorVotacao = document.querySelector('#autorVotacao').value;

    document.getElementById('selectPesquisas2').value = "";
    document.getElementById('selectPesquisas2').value = nomeVotacao;
    console.log(nomeVotacao);
    
    // Obter candidatos da lista
    const candidatos = [];
    document.querySelectorAll('#listaCandidatos li').forEach((candidatoElement) => {
        const nome = candidatoElement.querySelector('span').textContent;
        const foto1File = candidatoElement.querySelector('img:nth-child(2)').src;
        candidatos.push({ nome, foto1File });
    });

    // Salvar as fotos no Firebase Storage e obter as URLs
    const fotosURLs = await Promise.all(candidatos.map(async (candidato) => {
        const foto1Ref = storage.ref().child(`candidates/${nomeVotacao}/${candidato.nome}_foto1`);

        try {
            // Obter os blobs das imagens
            const foto1Blob = await fetch(candidato.foto1File).then(response => response.blob());

            // Salvar as imagens no Firebase Storage
            await foto1Ref.put(foto1Blob);

            // Obter as URLs das imagens
            const foto1URL = await foto1Ref.getDownloadURL();

            return { foto1URL };
        } catch (error) {
            console.error('Erro ao salvar ou obter URL da imagem:', error);
            return null; // Ou qualquer tratamento de erro desejado
        }
    }));

    // Salvar os dados no Firestore com URLs das fotos
    try {
        await db.collection('pesquisas').doc(nomeVotacao).set({
            nomeVotacao,
            descricaoVotacao,
            autorVotacao,
            candidatos: candidatos.map((candidato, index) => ({
                nome: candidato.nome,
                foto1URL: fotosURLs[index]?.foto1URL || '' // Verifica se a URL está presente
            })),
            dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
        });
        

        // Limpar campos do formulário após salvar os dados
        document.querySelector('#nomeVotacao').value = '';
        document.querySelector('#descricaoVotacao').value = '';
        document.querySelector('#autorVotacao').value = '';
        document.querySelector('#listaCandidatos').innerHTML = '';

        document.getElementById('cadastroVotacao').classList.add('hidden');
        document.getElementById('sectionVotacao').classList.add('hidden');
        document.getElementById('resultadosVotacao').classList.add('hidden');
        document.getElementById('cadastroCriado').classList.remove('hidden');
        
        document.getElementById("loadingOverlay").style.display = "none";
        alert('Votação cadastrada com sucesso!');
    } catch (error) {
        document.getElementById("loadingOverlay").style.display = "none";
        console.error('Erro ao salvar votação no Firestore:', error);
        alert('Erro ao salvar votação. Por favor, tente novamente mais tarde.');
    }
});

});

//-----------------------------------------------------------------------------------------------------
