
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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


// Começamos aqui

var usuario = null;

var formLogin = document.querySelector('form.login-form');

    
formLogin.addEventListener('submit',(e)=>{
e.preventDefault();
    let email = document.querySelector('[name=email]').value;
    let password = document.querySelector('[name=password]').value;
    //alert(email);
    //alert(password);
        
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        usuario = userCredential.user;
            
        //alert('Logado com sucesso! '+usuario.email);
        document.querySelector('.login, .background-login').style.display = "none";
        document.getElementById('cadastroVotacao').classList.remove('hidden');

        formLogin.reset();
        
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
    });
    });

const db = firebase.firestore();

firebase.auth().onAuthStateChanged((val)=>{

if(val){
    usuario=val;
    //alert('Bem-vindo de volta '+ usuario.email);

    document.querySelector('.login, .background-login').style.display = "none";

   
}
});


// Função para gerar um ID único de 6 dígitos
async function generateUniqueID() {
    const min = 100000; // Menor número de 6 dígitos
    const max = 999999; // Maior número de 6 dígitos

    let empresaID;
    do {
        empresaID = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (await isIDExists(empresaID));

    return empresaID;
}

// Função para verificar se o ID já existe no Firestore
async function isIDExists(id) {
    const empresaRef = db.collection('empresas').doc(id.toString());
    const snapshot = await empresaRef.get();
    return snapshot.exists;
}



document.addEventListener('DOMContentLoaded', async function() {

    // ----------------- Pré-Visualização do perfil ------------------------------


    // Seletor do botão para adicionar candidato
    const btnAdicionar = document.querySelector('#adicionarCandidato');

    // Event listener para o botão de adicionar candidato
    btnAdicionar.addEventListener('click', (event) => {
        event.preventDefault();
        const foto1URL = document.querySelector('#fotoPerfil').files[0];
        const foto2URL = document.querySelector('#fotoCapa').files[0];

        // Criar novo elemento para o PreView
        const novoPreView = document.createElement('div');
        novoPreView.innerHTML = `
            <img id="fotoCapaImg" src="${URL.createObjectURL(foto2URL)}" alt="Foto 1">
            <div class="perfilCaixa">
                <img id="fotoPerfilImg" src="${URL.createObjectURL(foto1URL)}" alt="Foto 1">
            </div>
        `;

        // Adicionar o novo candidato à lista de candidatos
        document.querySelector('#listaPreView').innerHTML = '';
        document.querySelector('#listaPreView').appendChild(novoPreView);
    });

    // --------------------- Enviar dados para db -----------------------------------

    // Seletor do formulário de cadastro
    const formCadastro = document.querySelector('#form-cadastroEmpresa');

    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // Animação de Espera ligada
        document.getElementById("loadingOverlay").style.display = "block";
    
        // Obter valores dos campos
        const nomeEmpresa = document.querySelector('#nomeEmpresa').value;
        const endereco = document.querySelector('#endereco').value;
        const localizacao = document.querySelector('#localizacao').value;
        const contatoNumber = document.querySelector('#contatoNumber').value;
        const categorias = document.querySelector('#categorias').value;
    
        // Obter as imagens selecionadas
        const fotoPerfilFile = document.querySelector('#fotoPerfil').files[0];
        const fotoCapaFile = document.querySelector('#fotoCapa').files[0];
    
        try {
            // Gerar um ID único de 6 dígitos
            const empresaID = await generateUniqueID();
    
            // Referências para o Firebase Storage
            const storage = firebase.storage();
            const storageRef = storage.ref();
    
            let fotoPerfilURL = null;

            // Verificar se o campo de seleção da foto de perfil foi preenchido e se é um arquivo válido
            if (fotoPerfilFile && fotoPerfilFile.type && fotoPerfilFile.name) {
                // Criar referência para a imagem do perfil no Storage
                const fotoPerfilRef = storageRef.child(`empresas/${nomeEmpresa}/fotoPerfil`);

                // Fazer upload da imagem do perfil para o Storage
                await fotoPerfilRef.put(fotoPerfilFile);

                // Obter a URL da imagem do perfil
                fotoPerfilURL = await fotoPerfilRef.getDownloadURL();
            } else {
                fotoPerfilURL = "https://firebasestorage.googleapis.com/v0/b/achei-devix.appspot.com/o/configs%2Fimg%2Ficon2.png?alt=media&token=07c9a55f-5540-4ee1-8fdb-b14c3c38b4d4";
            }

            // Inicializar a variável de URL da imagem de capa
            let fotoCapaURL = null;

            // Verificar se o campo de seleção da foto de capa foi preenchido e se é um arquivo válido
            if (fotoCapaFile && fotoCapaFile.type && fotoCapaFile.name) {
                // Criar referência para a imagem de capa no Storage
                const fotoCapaRef = storageRef.child(`empresas/${nomeEmpresa}/fotoCapa`);

                // Fazer upload da imagem de capa para o Storage
                await fotoCapaRef.put(fotoCapaFile);

                // Obter a URL da imagem de capa
                fotoCapaURL = await fotoCapaRef.getDownloadURL();
            } else {
                fotoCapaURL = "https://firebasestorage.googleapis.com/v0/b/achei-devix.appspot.com/o/configs%2Fimg%2Fbanner.png?alt=media&token=2e5fb5cd-c68d-4629-8ce8-45326f38fa39";
            }
    
            // Salvar os dados no Firestore
            const empresaData = {
                nomeEmpresa,
                endereco,
                localizacao,
                contatoNumber,
                categorias,
                fotoPerfilURL,
                fotoCapaURL,
                status: false,
                empresaID,
            };
    
            await db.collection('empresas').doc(empresaID.toString()).set(empresaData);
    
            // Animação de Espera desligada
            document.getElementById("loadingOverlay").style.display = "none";
    
            // Limpar o formulário
            formCadastro.reset();
    
            // Adicione o código para redirecionar ou fazer outras ações após o sucesso do envio.
    
        } catch (error) {
            console.error('Erro ao enviar ou obter URL das imagens:', error);
    
            // Animação de Espera desligada
            document.getElementById("loadingOverlay").style.display = "none";
        }
    });



});