
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
        const categorias = document.querySelector('#categorias').value;

        const contatoNumber = document.querySelector('#contatoNumber').value;
        const minhaCheckbox = document.getElementById('whastConfirmeCadastro');
         
        let temWhastapp = '';
            if (minhaCheckbox.checked) {
                temWhastapp = 'Sim';
            } else {
                temWhastapp = 'Não';
            }


    
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
                status: true,
                empresaID,
                temWhastapp,
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



    //----------------- Vizualizar Comentarios ---------------------------------------

    const listaNovosComentarios = document.querySelector('.listaNovosComentarios');

    // Adicione um evento de clique ao botão para aplicar o filtro
    document.getElementById('statusFilterBtn').addEventListener('click', carregarComentarios);


    // Função para obter e exibir comentários
    async function carregarComentarios(empresaID) {
        try {

            // Animação de Espera desligada
            document.getElementById("loadingOverlay").style.display = "flex";
            // Obtém o valor selecionado do select
            let statusFiltro = document.getElementById('statusFilter').value;
            let empresaID = document.getElementById('inputEmpresaID').value || '';
            
            // Consultar os comentários no Firestore com base no ID da empresa
            let query;
                if (empresaID) {
                    query = await db.collection(`comentarios/${empresaID}/comentariosInternos`).get();
                } else {
                    query = await db.collectionGroup('comentariosInternos').get();
                }
            

            // Limpar a lista de novos comentários
            listaNovosComentarios.innerHTML = '';

            // Iterar sobre os documentos retornados
            query.forEach((doc) => {
                const comentario = doc.data();
                const comentarioID = doc.id;

                let estrelas = "";
                for (let i = 0; i < comentario.nota; i++) {
                    estrelas += '<i class="bi bi-star-fill"></i>';
                }

                let status = ""
                if(comentario.status){
                     status = 'Desativar';
                } else {
                     status = 'Ativar';
                }

                // Verificar o status do comentário e renderizar com base no filtro selecionado
                if ((statusFiltro === 'statusTodos') ||
                (statusFiltro === 'statusTrue' && comentario.status) ||
                (statusFiltro === 'statusFalse' && !comentario.status)) {

                // Renderizar o comentário
                const novoItem = document.createElement('div');
                novoItem.classList.add('novoItem');
                novoItem.innerHTML = `
                <div class="comentario" style="color: #fff">
                    <div class="headerComent ${comentario.status ? 'headerComentAtivo' : ''}">
                        <p class="nomeComent">${comentario.nome} - ${comentario.empresaID} </p>
                        <p class="notaComent">${estrelas}<br></p>
                    </div>
                    <p class="textoComent">${comentario.texto}</p>
                </div>
                `;


                const novoItemBtn = document.createElement('div');
                novoItemBtn.classList.add('novoItemBtn');
                
                // Adicionar um botão para alterar o status
                const botaoStatus = document.createElement('button');
                botaoStatus.classList.add('botaoStatus');
                botaoStatus.textContent = status;
                botaoStatus.addEventListener('click', async () => {
        
                    let caminhoEmpresaID = comentario.empresaID.toString();

                    // Alterar o status no Firestore
                    const comentarioRef = db.collection('comentarios').doc(caminhoEmpresaID).collection('comentariosInternos').doc(comentarioID);
                    console.log(comentarioRef)
                    await comentarioRef.update({
                        status: !comentario.status
                    }); 
                    // Recarregar os comentários após a alteração
                    carregarComentarios(empresaID);
                });

                // Adicionar um botão para excluir o comentário
                const botaoExcluir = document.createElement('button');
                botaoExcluir.classList.add('botaoExcluir');
                botaoExcluir.textContent = 'Excluir';
                botaoExcluir.addEventListener('click', async () => {
                    let caminhoEmpresaID = comentario.empresaID.toString();

                    // Excluir o comentário do Firestore
                    const comentarioRef = db.collection('comentarios').doc(caminhoEmpresaID).collection('comentariosInternos').doc(comentarioID);
                    await comentarioRef.delete();
                    // Recarregar os comentários após a exclusão
                    carregarComentarios(empresaID);
                });

                // Adicionar o botão à lista de novos comentários
                novoItemBtn.appendChild(botaoStatus);
                // Adicionar o botão de excluir ao novo item
                novoItemBtn.appendChild(botaoExcluir);

                novoItem.appendChild(novoItemBtn);

                // Adicionar o item à lista de novos comentários
                listaNovosComentarios.appendChild(novoItem);
                }
                // Animação de Espera desligada
                document.getElementById("loadingOverlay").style.display = "none";
            });
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            // Animação de Espera desligada
            document.getElementById("loadingOverlay").style.display = "none";
        }
    }
    let empresaID = document.getElementById('inputEmpresaID').value || '';
    // Chamar a função para carregar os comentários ao carregar a página
    // Substitua '451515' pelo ID da empresa desejada
    carregarComentarios(empresaID);

    //---------------------------- Editar Cadastros ---------------------------------------

 
     // Adicionar evento de clique ao botão de pesquisa
     document.getElementById('editarEmpresaPesquisar').addEventListener('click', async () => {
         // Obter o ID da empresa digitado pelo usuário
        const empresaID = document.getElementById('empresaPesquisar').value.trim();
 
         try {
            // Animação de Espera ligada
            document.getElementById("loadingOverlay").style.display = "block";

             // Consultar o Firestore para obter os dados da empresa com base no ID fornecido
             const empresaDoc = await db.collection('empresas').doc(empresaID).get();
 
             if (empresaDoc.exists) {
                 // Preencher os campos do formulário de edição com os dados da empresa
                 const empresaData = empresaDoc.data();
                 document.querySelector('#editarNomeEmpresa').value = empresaData.nomeEmpresa;
                 document.querySelector('#editarEndereco').value = empresaData.endereco;
                 document.querySelector('#editarLocalizacao').value = empresaData.localizacao;
                 document.querySelector('#editarContatoNumber').value = empresaData.contatoNumber;
                 document.querySelector('#editarCategorias').value = empresaData.categorias;

                 const whastConfirmeEditar = document.getElementById('whastConfirmeEditar');

                 if (empresaData.temWhastapp === "Sim") {
                    whastConfirmeEditar.checked = true; // Marque a checkbox
                  } else {
                    whastConfirmeEditar.checked = false; // Desmarque a checkbox
                  }

                  console.log(empresaData.temWhastapp);
                 
 
             } else {
                 console.log('Empresa não encontrada.');
                 document.getElementById("loadingOverlay").style.display = "none";
             }

             
             document.getElementById("loadingOverlay").style.display = "none";
         } catch (error) {
             console.error('Erro ao buscar empresa:', error);
             document.getElementById("loadingOverlay").style.display = "none";
         }
     });
 
     const formEditarCadastro = document.getElementById('form-editarCadastroEmpresa');

    formEditarCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();
        // Animação de Espera ligada
        document.getElementById("loadingOverlay").style.display = "block";

        // Obter o ID da empresa (você pode obter de onde achar apropriado)
        const empresaID = document.getElementById('empresaPesquisar').value.trim();

        // Obter os novos valores dos campos do formulário de edição
        const novoNomeEmpresa = document.querySelector('#editarNomeEmpresa').value;
        const novoEndereco = document.querySelector('#editarEndereco').value;
        const novaLocalizacao = document.querySelector('#editarLocalizacao').value;
        const novoContatoNumber = document.querySelector('#editarContatoNumber').value;
        const novasCategorias = document.querySelector('#editarCategorias').value;
        const minhaCheckbox = document.getElementById('whastConfirmeEditar');
            
            let temWhastappEdit = '';
                if (minhaCheckbox.checked) {
                    temWhastappEdit = 'Sim';
                } else {
                    temWhastappEdit = 'Não';
                }

        // Obter as imagens selecionadas
        const fotoPerfilFileEdit = document.querySelector('#editarFotoPerfil').files[0];
        const fotoCapaFileEdit = document.querySelector('#editarFotoCapa').files[0];

        // Verificar se os campos do formulário são válidos antes de prosseguir
        // Adicione aqui a lógica para verificar os campos, se necessário

        const empresaDoc = await db.collection('empresas').doc(empresaID).get();
        const empresaData = empresaDoc.data();
        const fotoPerfilAntiga = empresaData.fotoPerfilURL;
        const fotoCapaAntiga = empresaData.fotoCapaURL;
        
        // Atualizar os dados da empresa no Firestore
        try {
                // Referências para o Firebase Storage
                const storage = firebase.storage();
                const storageRef = storage.ref();
        
                let fotoPerfilURLEdit = null;

                // Verificar se o campo de seleção da foto de perfil foi preenchido e se é um arquivo válido
                if (fotoPerfilFileEdit && fotoPerfilFileEdit.type && fotoPerfilFileEdit.name) {
                    // Criar referência para a imagem do perfil no Storage
                    const fotoPerfilRef = storageRef.child(`empresas/${empresaData.nomeEmpresa}/fotoPerfil`);

                    // Excluir foto antiga do storage
                    fotoPerfilRef.delete().then(() => {
                        console.log('Foto Antiga excluída com sucesso.');
                    }).catch((error) => {
                        console.error('Erro ao excluir o arquivo:', error);
                    });

                    // Fazer upload da imagem do perfil para o Storage
                    await fotoPerfilRef.put(fotoPerfilFileEdit);

                    // Obter a URL da imagem do perfil
                    fotoPerfilURLEdit = await fotoPerfilRef.getDownloadURL();
                } else {
                    fotoPerfilURLEdit = fotoPerfilAntiga;
                }

                // Inicializar a variável de URL da imagem de capa
                let fotoCapaURLEdit = null;

                // Verificar se o campo de seleção da foto de capa foi preenchido e se é um arquivo válido
                if (fotoCapaFileEdit && fotoCapaFileEdit.type && fotoCapaFileEdit.name) {
                    // Criar referência para a imagem de capa no Storage
                    const fotoCapaRef = storageRef.child(`empresas/${empresaData.nomeEmpresa}/fotoCapa`);

                    // Excluir foto antiga do storage
                    fotoCapaRef.delete().then(() => {
                        console.log('Foto Antiga excluída com sucesso.');
                    }).catch((error) => {
                        console.error('Erro ao excluir o arquivo:', error);
                    });

                    // Fazer upload da imagem de capa para o Storage
                    await fotoCapaRef.put(fotoCapaFileEdit);

                    // Obter a URL da imagem de capa
                    fotoCapaURLEdit = await fotoCapaRef.getDownloadURL();
                } else {
                    fotoCapaURLEdit = fotoCapaAntiga;
                }
            await db.collection('empresas').doc(empresaID).update({
                nomeEmpresa: novoNomeEmpresa,
                endereco: novoEndereco,
                localizacao: novaLocalizacao,
                contatoNumber: novoContatoNumber,
                categorias: novasCategorias,
                fotoPerfilURL: fotoPerfilURLEdit,
                fotoCapaURL: fotoCapaURLEdit,
                temWhastapp: temWhastappEdit,
            });

            console.log('Dados da empresa atualizados com sucesso.');
            document.getElementById("loadingOverlay").style.display = "none";

            // Adicione o código para exibir uma mensagem de sucesso ou redirecionar o usuário após a atualização
        } catch (error) {
            document.getElementById("loadingOverlay").style.display = "none";
            console.error('Erro ao atualizar dados da empresa:', error);
        }
    });



// ------------------- Configurar Banners ------------------------------------------

// Definir listaCategorias no escopo global
const listaCategorias = document.querySelector('.categoriasAPP');

// Adicionando ouvinte de evento para o botão de carregar categorias
const btnCarregarCategorias = document.querySelector('#btnCarregarCategorias');
btnCarregarCategorias.addEventListener('click', carregarCategorias);

// Função para carregar e exibir categorias
async function carregarCategorias() {
    try {
        // Ativar animação de espera
        document.getElementById("loadingOverlay").style.display = "flex";

        // Limpar a lista de categorias
        listaCategorias.innerHTML = '';

        // Consulta ao Firestore para obter os dados das categorias
        const querySnapshot = await db.collection('configsAPP').doc('paginaHome').collection('bannerCategorias').get();

        // Iterar sobre os documentos retornados
        querySnapshot.forEach((doc) => {
            const categoria = doc.data();

            // Criar elemento HTML para a categoria
            const listItem = document.createElement('div');
            listItem.classList.add('categoriaItem');

            const categoriaTitulo = document.createElement('h3');
            categoriaTitulo.textContent = categoria.categoria;

            const categoriaImagem = document.createElement('img');
            categoriaImagem.src = categoria.image;
            categoriaImagem.alt = categoria.categoria;

            // Criar botão de exclusão
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.addEventListener('click', () => excluirCategoria(doc.id, categoria.nomeImagem)); // Passar o nome da imagem ao excluir categoria

            // Adicionar elementos à lista de categorias
            listItem.appendChild(categoriaTitulo);
            listItem.appendChild(categoriaImagem);
            listItem.appendChild(btnExcluir);
            listaCategorias.appendChild(listItem);
        });

        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    }
}

// Função para excluir uma categoria
async function excluirCategoria(categoriaID, nomeImagem) {
    try {
        // Ativar animação de espera
        document.getElementById("loadingOverlay").style.display = "flex";

        // Referências para o Firebase Storage e Firestore
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const db = firebase.firestore();

        // Referência para a imagem no Storage
        const imagemRef = storageRef.child(`configs/img/${nomeImagem}`);

        // Excluir a imagem do Storage
        await imagemRef.delete();

        // Excluir os dados da categoria do Firestore
        await db.collection('configsAPP/paginaHome/bannerCategorias').doc(categoriaID).delete();

        // Recarregar a lista de categorias para refletir as alterações
        await carregarCategorias();

        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    }
}


// Adicionar nova Categoria ------------

// Adicionando ouvinte de evento para o botão de adicionar categoria
const btnAdicionarCategoria = document.querySelector('#btnAdicionarCategoria');
btnAdicionarCategoria.addEventListener('click', adicionarCategoria);

// Função para adicionar uma nova categoria
async function adicionarCategoria() {
    try {
        // Obter os valores dos campos de entrada
        const novaCategoriaInput = document.querySelector('#novaCategoriaInput').value.trim();
        const novaImagemInput = document.querySelector('#novaImagemInput').files[0]; // Obtém o arquivo selecionado
        const nomeImagem = novaImagemInput.name;

        // Verificar se os campos estão vazios
        if (!novaCategoriaInput || !novaImagemInput) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Ativar animação de espera
        document.getElementById("loadingOverlay").style.display = "flex";

        // Referências para o Firebase Storage
        const storage = firebase.storage();
        const storageRef = storage.ref();

        // Criar referência para a nova imagem no Storage
        const novaImagemRef = storageRef.child(`configs/img/${novaImagemInput.name}`);

        // Fazer upload da nova imagem para o Storage
        await novaImagemRef.put(novaImagemInput);

        // Obter a URL da nova imagem
        const novaImagemURL = await novaImagemRef.getDownloadURL();

        // Adicionar a nova categoria ao Firestore
        await db.collection('configsAPP/paginaHome/bannerCategorias').add({
            categoria: novaCategoriaInput,
            image: novaImagemURL,
            nomeImagem: nomeImagem
        });

        // Limpar os campos de entrada após adicionar a categoria
        document.querySelector('#novaCategoriaInput').value = '';
        document.querySelector('#novaImagemInput').value = '';

        // Recarregar a lista de categorias para exibir a nova categoria adicionada
        await carregarCategorias();

        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    }
}

// ------------------- Configurar Slide ------------------------------------------

// Definir listaSlide no escopo global
const listaSlide = document.querySelector('.SlideAPP');

// Adicionando ouvinte de evento para o botão de carregar Slide
const btnCarregarSlide = document.querySelector('#btnCarregarSlide');
btnCarregarSlide.addEventListener('click', carregarSlides);

// Função para carregar e exibir o slide
async function carregarSlides() {
    try {
        // Ativar animação de espera
        document.getElementById("loadingOverlay").style.display = "flex";

        // Limpar a lista de slide
        listaSlide.innerHTML = '';

        // Consulta ao Firestore para obter os dados dos slide
        const querySnapshot = await db.collection('configsAPP').doc('paginaHome').collection('slides').get();

        // Iterar sobre os documentos retornados
        querySnapshot.forEach((doc) => {
            const slides = doc.data();

            // Criar elemento HTML para 0 slide
            const listItem = document.createElement('div');
            listItem.classList.add('slideItem');

            const slideempresaID = document.createElement('p');
            slideempresaID.classList.add('ItemID');
            slideempresaID.textContent = slides.perfilRelacionado;

            const slideImagem = document.createElement('img');
            slideImagem.src = slides.image;
            slideImagem.alt = slides.title;

            const slideTitulo = document.createElement('p');
            slideTitulo.textContent = slides.text;

            // Criar botão de exclusão
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.addEventListener('click', () => excluirSlide(doc.id, slides.nomeImagem)); // Passar o nome da imagem ao excluir categoria

            // Adicionar elementos à lista de categorias

            listItem.appendChild(slideempresaID);
            listItem.appendChild(slideImagem);
            listItem.appendChild(slideTitulo);
            listItem.appendChild(btnExcluir);
            listaSlide.appendChild(listItem);
        });

        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    }
}

// Função para excluir um slide
async function excluirSlide(slideID, nomeImagem) {
    try {
        // Ativar animação de espera
        document.getElementById("loadingOverlay").style.display = "flex";

        // Referências para o Firebase Storage e Firestore
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const db = firebase.firestore();

        // Referência para a imagem no Storage
        const imagemRef = storageRef.child(`configs/img/${nomeImagem}`);

        // Excluir a imagem do Storage
        await imagemRef.delete();

        // Excluir os dados do slide do Firestore
        await db.collection('configsAPP/paginaHome/slides').doc(slideID).delete();

        // Recarregar a lista de slides para refletir as alterações
        await carregarSlides();

        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    }
}


// Adicionar nova Categoria ------------


// Adicionando ouvinte de evento para o botão de adicionar categoria
const btnAdicionarSlide = document.querySelector('#btnAdicionarSlide');
btnAdicionarSlide.addEventListener('click', adicionarSlide);

// Função para adicionar uma nova categoria
async function adicionarSlide() {
    try {
        // Obter os valores dos campos de entrada
        const slideEmpresaID = document.querySelector('#slideEmpresaID').value.trim();
        const novoTextInput = document.querySelector('#novoTextInput').value.trim();
        const novotitleInput = document.querySelector('#novotitleInput').value.trim();
        const novaImagemSlide = document.querySelector('#novaImagemSlide').files[0]; // Obtém o arquivo selecionado
        const nomeImagem = novaImagemSlide.name;

        // Verificar se os campos estão vazios
        if (!novaImagemSlide || !novaImagemSlide) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Ativar animação de espera
        document.getElementById("loadingOverlay").style.display = "flex";

        // Referências para o Firebase Storage
        const storage = firebase.storage();
        const storageRef = storage.ref();

        // Criar referência para a nova imagem no Storage
        const novaImagemSlideRef = storageRef.child(`configs/img/${novaImagemSlide.name}`);

        // Fazer upload da nova imagem para o Storage
        await novaImagemSlideRef.put(novaImagemSlide);

        // Obter a URL da nova imagem
        const novaImagemSlideURL = await novaImagemSlideRef.getDownloadURL();

        // Gera Key aleatoria
        const querySnapshot = await db.collection('configsAPP').doc('paginaHome').collection('slides').get();
        const existingKeys = querySnapshot.docs.map(doc => doc.data().key);

        let newKey;
        do {
            newKey = Math.floor(Math.random() * 10); // Gera um número aleatório de 0 a 9
        } while (existingKeys.includes(newKey)); // Verifica se o número gerado já existe

        console.log(existingKeys)
        console.log(newKey)

        // Adicionar a nova slides ao Firestore
        await db.collection('configsAPP/paginaHome/slides').add({
            perfilRelacionado: slideEmpresaID,
            key: newKey,
            text: novoTextInput,
            title: novotitleInput,
            image: novaImagemSlideURL,
            nomeImagem: nomeImagem
        });

        // Limpar os campos de entrada após adicionar a categoria
        document.querySelector('#slideEmpresaID').value = '';
        document.querySelector('#novoTextInput').value = '';
        document.querySelector('#novotitleInput').value = '';
        document.querySelector('#novaImagemSlide').value = '';

        // Recarregar a lista de slides para exibir a novo slide adicionada
        await carregarSlides();

        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        // Desativar animação de espera
        document.getElementById("loadingOverlay").style.display = "none";
    }
}
                 
 

});