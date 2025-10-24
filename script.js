// --- ESTADO GLOBAL E CONSTANTES ---
const ESTADO_JOGO = {
  config: {
    numJogadores: 3,
    numImpostores: 1,
    categoriasSelecionadas: [],
  },
  partida: {
    placar: { impostor: 0, cidadao: 0 },
    rodada: 1,
    impostoresReais: 0,
    telaAnterior: "",
    impostoresParaAdivinhar: [], // Fila de impostores que ainda precisam adivinhar
    impostoresDescobertosNestaRodada: [], // Lista de todos os impostores pegos na rodada
    impostorAdivinhando: null, // Guarda quem está na vez de adivinhar a palavra
    tempoInicioPartida: null, // Armazena o timestamp do início da partida
  },
  jogadores: [],
  palavraSecreta: "",
  categoriaDaRodada: "",
  jogadorAtualIndex: 0,
  todasCategorias: {},
};

const MIN_JOGADORES_PARA_2_IMPOSTORES = 7;
const OPCOES_DE_PALPITE = 8;

// --- SELETORES DE ELEMENTOS DA DOM ---
const TELAS = {
  inicial: document.getElementById("telaInicial"),
  configuracao: document.getElementById("telaConfiguracao"),
  categorias: document.getElementById("telaCategorias"),
  nomes: document.getElementById("telaNomes"),
  principal: document.getElementById("telaPrincipal"),
  discussao: document.getElementById("telaDiscussao"),
  resultados: document.getElementById("telaResultados"),
  fimDeJogo: document.getElementById("telaFimDeJogo"),
};

const cabecalhoJogo = document.getElementById("cabecalho-jogo");
const placarDiv = document.getElementById("placar");
const tituloCabecalho = document.getElementById("titulo-cabecalho");
const infoRodadaDiv = document.getElementById("info-rodada");
const infoTemaDiv = document.getElementById("info-tema");
const placarImpostorSpan = document.getElementById("placar-impostor");
const placarCidadaoSpan = document.getElementById("placar-cidadao");
const selecaoJogadoresDiv = document.getElementById("selecaoJogadores");
const selecaoImpostoresDiv = document.getElementById("selecaoImpostores");
const categoriasContainer = document.getElementById("categoriasContainer");
const nomesContainer = document.getElementById("nomesContainer");
const cardVisualizacao = document.getElementById("cardVisualizacao");
const resultadosCard = TELAS.resultados.querySelector(".card");
const fimDeJogoContainer = document.getElementById("fimDeJogoContainer");
const popup = document.getElementById("popup");
const popupMensagem = document.getElementById("popup-mensagem");
const popupFecharBtn = document.getElementById("popup-fechar");
const regrasSlidesContainer = document.getElementById(
  "regras-slides-container"
);
const regrasDotsContainer = document.getElementById("regras-dots");
const btnRegraAnterior = document.getElementById("regras-anterior");
const btnRegraProximo = document.getElementById("regras-proximo");
const btnVoltar = document.getElementById("btn-voltar");
const btnFechar = document.getElementById("btn-fechar");

// --- LÓGICA DO POPUP ---
let acaoAposPopup = null;
function exibirPopup(mensagem, acao = null) {
  popupMensagem.textContent = mensagem;
  popup.classList.remove("hidden");
  acaoAposPopup = acao;
}
function fecharPopup() {
  popup.classList.add("hidden");
  if (acaoAposPopup) {
    acaoAposPopup();
    acaoAposPopup = null;
  }
}

// --- LÓGICA DO CARROSSEL DE REGRAS ---
let slideAtualRegras = 0;
let totalSlidesRegras = 0;
async function carregarEExibirRegras() {
  try {
    const resposta = await fetch("regras.json");
    if (!resposta.ok) throw new Error("Falha ao carregar regras.json");
    const dados = await resposta.json();
    const regras = dados.regras;
    totalSlidesRegras = regras.length;
    regrasSlidesContainer.innerHTML = "";
    regrasDotsContainer.innerHTML = "";
    regras.forEach((regra, index) => {
      const slide = document.createElement("div");
      slide.className = "regras-slide";
      slide.innerHTML = `<h3>${regra.titulo}</h3><p>${regra.descricao}</p>`;
      regrasSlidesContainer.appendChild(slide);
      const dot = document.createElement("div");
      dot.className = "regras-dot";
      dot.dataset.slide = index;
      regrasDotsContainer.appendChild(dot);
    });
    mostrarSlideRegra(0);
  } catch (erro) {
    console.error("Erro ao carregar regras:", erro);
    regrasSlidesContainer.innerHTML = `<p class="text-red-400">Não foi possível carregar as regras.</p>`;
  }
}
function mostrarSlideRegra(index) {
  slideAtualRegras = index;
  
  // 1. Obter todos os slides de regra
  const slides = regrasSlidesContainer.querySelectorAll('.regras-slide');

  // 2. Iterar e esconder todos os slides
  slides.forEach((slide, i) => {
    // Usamos 'hidden' que é 'display: none' pelo Tailwind
    slide.classList.add('hidden'); 
  });

  // 3. Mostrar apenas o slide atual
  if (slides[index]) {
    slides[index].classList.remove('hidden');
  }

  // NOTE: A linha abaixo é removida porque não é mais necessária 
  // para o modelo de mostrar/esconder:
  // regrasSlidesContainer.style.transform = `translateX(${-index * 100}%)`;

  // 4. Atualizar os pontos de navegação (dots)
  document
    .querySelectorAll(".regras-dot")
    .forEach((dot, i) => dot.classList.toggle("active", i === index));
    
  // 5. Desabilitar botões de navegação nos extremos
  btnRegraAnterior.disabled = index === 0;
  btnRegraProximo.disabled = index === totalSlidesRegras - 1;
}

// --- FUNÇÕES UTILITÁRIAS ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function formatarListaNomes(nomes) {
  if (!nomes || nomes.length === 0) return "";
  if (nomes.length === 1) return nomes[0];
  const ultimo = nomes.pop();
  return `${nomes.join(", ")} e ${ultimo}`;
}

// --- FUNÇÕES DE CONTROLE DE UI E JOGO ---
function voltarTelaAnterior() {
    const telaAtual = Object.keys(TELAS).find(key => !TELAS[key].classList.contains('hidden'));

    const fluxoTelas = {
        'nomes': 'categorias',
        'categorias': 'configuracao',
        'configuracao': 'inicial'
    };

    if (fluxoTelas[telaAtual]) {
        trocarTela(fluxoTelas[telaAtual]);
    }
}

function trocarTela(nomeTela) {
  Object.values(TELAS).forEach((tela) => tela.classList.add("hidden"));
  if (TELAS[nomeTela]) TELAS[nomeTela].classList.remove("hidden");
  const telasSetup = ["configuracao", "categorias", "nomes"];
  const telasRodada = ["principal", "discussao", "resultados"];

  if (telasSetup.includes(nomeTela)) {
    btnVoltar.classList.remove("hidden", "opacity-50", "pointer-events-none");
    btnFechar.classList.remove("hidden", "opacity-50", "pointer-events-none");
  } else if (telasRodada.includes(nomeTela)) {
    btnVoltar.classList.remove("hidden");
    btnVoltar.classList.add("opacity-50", "pointer-events-none");

    btnFechar.classList.remove("hidden", "opacity-50", "pointer-events-none");
  } else {
    btnVoltar.classList.add("hidden");
    btnFechar.classList.add("hidden");
  }

  if (["inicial", "principal", "resultados", "fimDeJogo"].includes(nomeTela)) {
    cabecalhoJogo.classList.add("hidden");
  } else {
    cabecalhoJogo.classList.remove("hidden");
  }

  if (["configuracao", "categorias", "nomes"].includes(nomeTela)) {
    atualizarCabecalho("titulo");
  }
}

function atualizarCabecalho(estado) {
  if (estado === "titulo") {
    placarDiv.classList.add("hidden");
    infoRodadaDiv.classList.add("hidden");
    infoTemaDiv.classList.add("hidden");
    tituloCabecalho.classList.remove("hidden");
  } else {
    tituloCabecalho.classList.add("hidden");
    placarDiv.classList.remove("hidden");
    infoRodadaDiv.classList.remove("hidden");
    infoTemaDiv.classList.remove("hidden");
    placarImpostorSpan.textContent = `👻 ${ESTADO_JOGO.partida.placar.impostor}`;
    placarCidadaoSpan.textContent = `${ESTADO_JOGO.partida.placar.cidadao} 😇`;
    infoRodadaDiv.innerHTML = `🔄 Rodada ${ESTADO_JOGO.partida.rodada}`;
    infoTemaDiv.innerHTML = `📚 ${ESTADO_JOGO.categoriaDaRodada}`;
  }
}

// --- PERSISTÊNCIA ---
function salvarConfiguracao() {
  localStorage.setItem("configImpostor", JSON.stringify(ESTADO_JOGO.config));
}
function carregarConfiguracao() {
  const configSalva = localStorage.getItem("configImpostor");
  if (configSalva) ESTADO_JOGO.config = JSON.parse(configSalva);
}

// --- LÓGICA DE CONFIGURAÇÃO ---
function criarBotoesDeSelecao() {
  selecaoJogadoresDiv.innerHTML = "";
  for (let i = 3; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className = "btn-toggle";
    btn.textContent = i;
    btn.dataset.valor = i;
    btn.onclick = () => selecionarOpcao("numJogadores", i);
    selecaoJogadoresDiv.appendChild(btn);
  }
  selecaoImpostoresDiv.innerHTML = "";
  for (let i = 1; i <= 2; i++) {
    const btn = document.createElement("button");
    btn.className = "btn-toggle";
    btn.textContent = i;
    btn.dataset.valor = i;
    btn.onclick = () => selecionarOpcao("numImpostores", i);
    selecaoImpostoresDiv.appendChild(btn);
  }
  atualizarBotoes();
}
function selecionarOpcao(tipo, valor) {
  ESTADO_JOGO.config[tipo] = valor;
  if (ESTADO_JOGO.config.numJogadores < MIN_JOGADORES_PARA_2_IMPOSTORES) {
    ESTADO_JOGO.config.numImpostores = 1;
  }
  salvarConfiguracao();
  atualizarBotoes();
}
function atualizarBotoes() {
  document.querySelectorAll("#selecaoJogadores .btn-toggle").forEach((btn) => {
    btn.classList.toggle(
      "active",
      parseInt(btn.dataset.valor) === ESTADO_JOGO.config.numJogadores
    );
  });
  document.querySelectorAll("#selecaoImpostores .btn-toggle").forEach((btn) => {
    const valor = parseInt(btn.dataset.valor);
    const isAtivo = valor === ESTADO_JOGO.config.numImpostores;
    const isDesativado =
      valor === 2 &&
      ESTADO_JOGO.config.numJogadores < MIN_JOGADORES_PARA_2_IMPOSTORES;
    btn.classList.toggle("active", isAtivo && !isDesativado);
    btn.disabled = isDesativado;
  });
}
async function carregarEExibirCategorias() {
  try {
    const resposta = await fetch("palavras.json");
    if (!resposta.ok) throw new Error("Falha ao carregar palavras.json");
    ESTADO_JOGO.todasCategorias = await resposta.json();
    categoriasContainer.innerHTML = "";
    Object.keys(ESTADO_JOGO.todasCategorias).forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "btn-categoria";
      btn.textContent = cat;
      btn.dataset.categoria = cat;
      btn.onclick = () => selecionarCategoria(cat, btn);
      if (ESTADO_JOGO.config.categoriasSelecionadas.includes(cat))
        btn.classList.add("active");
      categoriasContainer.appendChild(btn);
    });
  } catch (e) {
    document.body.innerHTML = `<div class="p-8 text-center"><h1 class="text-red-500">Erro ao carregar o jogo.</h1></div>`;
  }
}
function selecionarCategoria(categoria, btn) {
  const index = ESTADO_JOGO.config.categoriasSelecionadas.indexOf(categoria);
  if (index > -1) ESTADO_JOGO.config.categoriasSelecionadas.splice(index, 1);
  else ESTADO_JOGO.config.categoriasSelecionadas.push(categoria);
  btn.classList.toggle("active");
  salvarConfiguracao();
}

// --- FLUXO DE JOGO ---
function avancarParaNomes() {
  if (ESTADO_JOGO.config.categoriasSelecionadas.length === 0) {
    exibirPopup("Selecione pelo menos uma categoria para jogar!");
    return;
  }
  nomesContainer.innerHTML = "";
  for (let i = 0; i < ESTADO_JOGO.config.numJogadores; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Nome do Jogador ${i + 1}`;
    input.className = "input-form";
    nomesContainer.appendChild(input);
  }
  trocarTela("nomes");
}
function iniciarPartida() {
  const nomes = Array.from(nomesContainer.querySelectorAll(".input-form")).map(
    (i) => i.value.trim()
  );
  if (nomes.some((n) => n === "")) {
    exibirPopup("Por favor, preencha o nome de todos os jogadores.");
    return;
  }
  ESTADO_JOGO.partida = {
    placar: { impostor: 0, cidadao: 0 },
    rodada: 1,
    impostoresReais: 0,
    telaAnterior: "",
    impostoresParaAdivinhar: [],
    impostoresDescobertosNestaRodada: [],
    impostorAdivinhando: null,
    tempoInicioPartida: new Date(),
  };
  ESTADO_JOGO.jogadores = nomes.map((nome, id) => ({ id, nome, pontos: 0 }));
  sortearRolesEIniciar();
}
function sortearRolesEIniciar() {
  // Se for a primeira rodada, marca o início da partida
  if (
    ESTADO_JOGO.partida.rodada === 1 &&
    !ESTADO_JOGO.partida.tempoInicioPartida
  ) {
    ESTADO_JOGO.partida.tempoInicioPartida = new Date();
  }

  let numSorteado = ESTADO_JOGO.config.numImpostores;
  if (numSorteado === 2) numSorteado = Math.random() < 0.5 ? 1 : 2;
  ESTADO_JOGO.partida.impostoresReais = numSorteado;

  const catSorteada =
    ESTADO_JOGO.config.categoriasSelecionadas[
      Math.floor(
        Math.random() * ESTADO_JOGO.config.categoriasSelecionadas.length
      )
    ];
  const palavrasDaCat = ESTADO_JOGO.todasCategorias[catSorteada];
  ESTADO_JOGO.palavraSecreta =
    palavrasDaCat[Math.floor(Math.random() * palavrasDaCat.length)];
  ESTADO_JOGO.categoriaDaRodada = catSorteada;

  const indices = Array.from(Array(ESTADO_JOGO.config.numJogadores).keys());
  shuffleArray(indices);
  const indicesImpostores = new Set(indices.slice(0, numSorteado));

  ESTADO_JOGO.jogadores.forEach((j) => {
    j.papel = indicesImpostores.has(j.id) ? "Impostor" : "Cidadão";
    j.revelacao =
      j.papel === "Impostor"
        ? ESTADO_JOGO.categoriaDaRodada
        : ESTADO_JOGO.palavraSecreta;
  });

  shuffleArray(ESTADO_JOGO.jogadores);
  ESTADO_JOGO.jogadorAtualIndex = 0;
  trocarTela("principal");
  mostrarCardAtual();
}
function mostrarCardAtual() {
  const jogador = ESTADO_JOGO.jogadores[ESTADO_JOGO.jogadorAtualIndex];
  cardVisualizacao.innerHTML = `<h2 class="text-4xl font-bold mb-4">${jogador.nome}</h2><p class="subtitulo">É a sua vez de descobrir seu papel secreto.</p><button class="btn btn-primary w-full max-w-xs" onclick="revelarConteudo()">👀 Ver meu papel</button>`;
}
async function revelarConteudo() {
  const j = ESTADO_JOGO.jogadores[ESTADO_JOGO.jogadorAtualIndex];
  const isImpostor = j.papel === "Impostor";

  let svgHtml = "";
  let palavraOuCategoria = "";
  let subtituloPalavra = "";

  // Se o jogador for um Cidadão, ele tem um objeto de revelação com a palavra e o caminho do SVG
  if (!isImpostor) {
    palavraOuCategoria = j.revelacao.palavra; // Agora acessamos a propriedade .palavra
    subtituloPalavra = `<p class="text-xs text-slate-400 mt-1">(Categoria: ${ESTADO_JOGO.categoriaDaRodada})</p>`;
    
    // Tenta carregar o arquivo JSON do SVG
    try {
      const resposta = await fetch(j.revelacao.valor); // j.revelacao.valor tem o caminho como "assets/svg/solid/cat.json"
      if (resposta.ok) {
        const dadosIcone = await resposta.json();
        // A estrutura de JSON do FontAwesome geralmente guarda os dados do ícone em um array
        // Onde: icon[0] = largura, icon[1] = altura, icon[4] = path do SVG
        if (dadosIcone && dadosIcone.icon && dadosIcone.icon.length === 5) {
           const icone = dadosIcone.icon;
           const viewBox = `0 0 ${icone[0]} ${icone[1]}`;
           const path = icone[4];
           // Montamos o HTML do SVG que será exibido
           svgHtml = `<div class="revelacao-svg-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="revelacao-svg"><path fill="currentColor" d="${path}"></path></svg></div>`;
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar o arquivo SVG JSON:", erro);
      // Se der erro, o jogo continua, apenas não exibe o ícone.
    }
  } else {
    // Se for um Impostor, a revelação é apenas a string da categoria
    palavraOuCategoria = j.revelacao;
  }

  // Monta o HTML final do card
  let html = `<div class="text-7xl mb-4">${ isImpostor ? "👻" : "😇" }</div>
    <p class="text-sm font-semibold text-slate-400 tracking-widest">SEU PAPEL</p>
    <p class="text-5xl font-bold my-2 ${ isImpostor ? "text-red-400" : "text-cyan-400" }">${j.papel}</p>
    <hr class="border-slate-600 my-4 w-full">
    ${svgHtml} <p class="text-sm font-semibold text-slate-400 tracking-widest">${ isImpostor ? "A CATEGORIA É:" : "A PALAVRA SECRETA É:"}</p>
    <p class="text-3xl font-bold mt-2">${palavraOuCategoria}</p>
    ${subtituloPalavra}`;

  cardVisualizacao.innerHTML = `<div class="hidden-content w-full flex flex-col items-center text-center">${html}</div><button class="btn btn-primary w-full max-w-xs mt-8" onclick="proximoJogador()">Ok, entendi!</button>`;
}
function proximoJogador() {
  ESTADO_JOGO.jogadorAtualIndex++;
  if (ESTADO_JOGO.jogadorAtualIndex < ESTADO_JOGO.config.numJogadores) {
    mostrarCardAtual();
  } else {
    exibirPopup(
      `Todos os papéis foram revelados! A Rodada ${ESTADO_JOGO.partida.rodada} vai começar.`,
      () => {
        atualizarCabecalho("rodada");
        trocarTela("discussao");
      }
    );
  }
}

// --- LÓGICA DE FIM DE RODADA ---
function iniciarVotacao() {
  const isModoPlural = ESTADO_JOGO.partida.impostoresReais > 1;

  let subtitulo = isModoPlural
    ? "Selecione até 2 jogadores que você acha que são os impostores."
    : "Selecione o jogador que você acha que é o impostor.";

  resultadosCard.innerHTML = `
        <h2 class="titulo">🗳️ Votação</h2>
        <p class="subtitulo">${subtitulo}</p>
        <div id="votacao-jogadores-container" class="grid grid-cols-2 gap-3">
            ${ESTADO_JOGO.jogadores
              .map(
                (j) =>
                  `<button class="btn-toggle p-4" data-nome="${j.nome}" onclick="selecionarJogadorParaVoto(this)">${j.nome}</button>`
              )
              .join("")}
        </div>
        <button id="btn-confirmar-voto" class="btn btn-danger w-full mt-6" disabled onclick="confirmarVotos()">Confirmar Voto!</button>`;

  trocarTela("resultados");
}
function selecionarJogadorParaVoto(botao) {
  const container = document.getElementById("votacao-jogadores-container");
  const selecionados = container.querySelectorAll(".active");
  const maxVotos = ESTADO_JOGO.partida.impostoresReais > 1 ? 2 : 1;

  if (botao.classList.contains("active")) {
    botao.classList.remove("active");
  } else {
    if (selecionados.length < maxVotos) {
      botao.classList.add("active");
    }
  }
  const novosSelecionados = container.querySelectorAll(".active");
  document.getElementById("btn-confirmar-voto").disabled =
    novosSelecionados.length === 0;
}
function confirmarVotos() {
  const selecionados = Array.from(
    document.querySelectorAll("#votacao-jogadores-container .active")
  ).map((b) => b.dataset.nome);
  const jogadoresVotados = selecionados.map((nome) =>
    ESTADO_JOGO.jogadores.find((j) => j.nome === nome)
  );
  const impostoresVotados = jogadoresVotados.filter(
    (j) => j.papel === "Impostor"
  );
  const cidadaosVotados = jogadoresVotados.filter((j) => j.papel === "Cidadão");

  if (cidadaosVotados.length > 0) {
    registrarVitoria("impostor", 2); // <-- ALTERADO
    const nomes = cidadaosVotados.map((j) => j.nome);
    const nomesFormatados = formatarListaNomes(nomes);
    const motivo =
      nomes.length > 1
        ? `${nomesFormatados} foram eliminados injustamente!`
        : `${nomesFormatados} foi eliminado injustamente!`;
    exibirResultadoDaRodada("impostor", motivo);
  } else if (impostoresVotados.length === ESTADO_JOGO.partida.impostoresReais) {
    registrarVitoria("cidadao", 1);
    impostorDescoberto(impostoresVotados);
  } else {
    registrarVitoria("impostor", 2); // <-- ALTERADO
    const nomesEncontrados = formatarListaNomes(
      impostoresVotados.map((j) => j.nome)
    );
    const numEscaparam =
      ESTADO_JOGO.partida.impostoresReais - impostoresVotados.length;
    const textoEscaparam =
      numEscaparam > 1
        ? `${numEscaparam} impostores escaparam`
        : "1 impostor escapou";
    const motivo = `Vocês encontraram ${nomesEncontrados}, mas ${textoEscaparam}!`;
    exibirResultadoDaRodada("impostor", motivo);
  }
}

function impostorDescoberto(impostores) {
  ESTADO_JOGO.partida.impostoresParaAdivinhar = [...impostores];
  ESTADO_JOGO.partida.impostoresDescobertosNestaRodada = [...impostores];
  proximoImpostorParaAdivinhar();
}

function proximoImpostorParaAdivinhar() {
  if (ESTADO_JOGO.partida.impostoresParaAdivinhar.length === 0) {
    const impostoresPegos =
      ESTADO_JOGO.partida.impostoresDescobertosNestaRodada;
    const nomes = impostoresPegos.map((j) => j.nome);
    const nomesFormatados = formatarListaNomes(nomes);
    let motivo;
    if (impostoresPegos.length > 1) {
      motivo = `${nomesFormatados} foram pegos e erraram seus palpites!`;
    } else {
      motivo = `${nomesFormatados} foi pego e errou o palpite!`;
    }
    exibirResultadoDaRodada("cidadao", motivo);
    return;
  }

  const impostor = ESTADO_JOGO.partida.impostoresParaAdivinhar.shift();
  ESTADO_JOGO.partida.impostorAdivinhando = impostor;

  const palavrasDaCategoria = [
    ...ESTADO_JOGO.todasCategorias[ESTADO_JOGO.categoriaDaRodada],
  ];
  const palavraCerta = ESTADO_JOGO.palavraSecreta.palavra; // AJUSTE AQUI
  const distratores = palavrasDaCategoria.filter((p) => p.palavra !== palavraCerta); // AJUSTE AQUI
  shuffleArray(distratores);
  const opcoes = distratores.slice(0, OPCOES_DE_PALPITE - 1);
  opcoes.push(ESTADO_JOGO.palavraSecreta); // Adiciona o objeto inteiro
  shuffleArray(opcoes);

  resultadosCard.innerHTML = `
        <h2 class="titulo text-red-400">🚨 Impostor Descoberto!</h2>
        <p class="subtitulo">${
          impostor.nome
        }, você foi pego! Adivinhe a palavra para uma última chance.</p>
        <div class="my-4 grid grid-cols-2 gap-3">
            ${opcoes
              .map(
                (o) =>
                  // AJUSTE AQUI para usar o.palavra no texto e na função
                  `<button class="btn-toggle p-3" onclick="verificarAdivinhacao('${o.palavra}')">${o.palavra}</button>`
              )
              .join("")}
        </div>
         <button class="btn btn-secondary w-full mt-4" onclick="verificarAdivinhacao('')">Desistir do Palpite</button>
    `;
}

function verificarAdivinhacao(palpite) {
  if (palpite === ESTADO_JOGO.palavraSecreta.palavra) {
    registrarVitoria("impostor", 2);
    const impostorQueAcertou = ESTADO_JOGO.partida.impostorAdivinhando;
    const motivo = `${impostorQueAcertou.nome} acertou a palavra secreta e virou o jogo!`;
    exibirResultadoDaRodada("impostor", motivo);
  } else {
    proximoImpostorParaAdivinhar();
  }
}

function registrarVitoria(vencedor, pontos = 1) {
  if (vencedor === "impostor") {
    ESTADO_JOGO.partida.placar.impostor++;
    ESTADO_JOGO.jogadores.forEach((j) => {
      if (j.papel === "Impostor") j.pontos += pontos;
    });
  } else {
    ESTADO_JOGO.partida.placar.cidadao++;
    ESTADO_JOGO.jogadores.forEach((j) => {
      if (j.papel === "Cidadão") j.pontos += pontos;
    });
  }
  atualizarCabecalho("rodada");
}

function exibirResultadoDaRodada(vencedor, motivo) {
  const titulo =
    vencedor === "impostor"
      ? "👻 Vitória do Impostor!"
      : "😇 Vitória dos Cidadãos!";
  const impostores = ESTADO_JOGO.jogadores.filter(
    (j) => j.papel === "Impostor"
  );
  const tituloImpostor =
    ESTADO_JOGO.partida.impostoresReais > 1
      ? "Os Impostores eram:"
      : "O Impostor era:";
  resultadosCard.innerHTML = `
        <h2 class="titulo ${
          vencedor === "impostor" ? "text-amber-400" : "text-cyan-400"
        }">${titulo}</h2>
        <p class="subtitulo">${motivo}</p>
        <div class="my-4 p-4 bg-gray-800/50 rounded-xl space-y-2">
            <p><strong>Palavra Secreta:</strong> ${
              ESTADO_JOGO.palavraSecreta.palavra
            }</p>
            <p><strong>${tituloImpostor}</strong> ${formatarListaNomes(
    impostores.map((j) => j.nome)
  )}</p>
        </div>
        <div class="flex flex-col gap-3 mt-8">
            <button onclick="proximaRodada()" class="btn btn-success w-full">Próxima Rodada</button>
            <button onclick="exibirRankingFinalAnimado()" class="btn btn-secondary w-full">Finalizar Partida</button>
        </div>`;
}

function proximaRodada() {
  ESTADO_JOGO.partida.rodada++;
  sortearRolesEIniciar();
}

// --- RANKING E PLACAR PARCIAL ---

function exibirRankingFinalAnimado() {
  trocarTela("fimDeJogo");
  const container = fimDeJogoContainer;
  container.innerHTML = `<h2 class="titulo-ranking-final animate-pulse">Calculando resultados...</h2>`;

  const jogadoresOrdenados = [...ESTADO_JOGO.jogadores].sort(
    (a, b) => b.pontos - a.pontos
  );

  const tempoFinal = new Date();
  const tempoTotalMs = tempoFinal - ESTADO_JOGO.partida.tempoInicioPartida;
  const minutos = Math.floor(tempoTotalMs / 60000);
  const segundos = Math.floor((tempoTotalMs % 60000) / 1000);
  const tempoFormatado = `${minutos}m ${segundos}s`;

  setTimeout(() => {
    container.innerHTML = `
      <div class="podium-container">
        <div id="podium-2" class="podium-step podium-step-2"></div>
        <div id="podium-1" class="podium-step podium-step-1"></div>
        <div id="podium-3" class="podium-step podium-step-3"></div>
      </div>
      <div id="resumo-partida" class="resumo-partida"></div>
      <div id="botoes-finais" class="botoes-finais"></div>
    `;

    const p2 = jogadoresOrdenados[1];
    const p1 = jogadoresOrdenados[0];
    const p3 = jogadoresOrdenados[2];

    setTimeout(() => {
      if (p3) {
        document.getElementById("podium-3").innerHTML = `
          <div class="posicao">3º</div>
          <div class="nome">${p3.nome}</div>
          <div class="pontos">${p3.pontos} Pts</div>`;
        document.getElementById("podium-3").classList.add("revelado");
      }
    }, 500);

    setTimeout(() => {
      if (p2) {
        document.getElementById("podium-2").innerHTML = `
          <div class="posicao">2º</div>
          <div class="nome">${p2.nome}</div>
          <div class="pontos">${p2.pontos} Pts</div>`;
        document.getElementById("podium-2").classList.add("revelado");
      }
    }, 1500);

    setTimeout(() => {
      if (p1) {
        document.getElementById("podium-1").innerHTML = `
          <div class="posicao">🏆 1º</div>
          <div class="nome">${p1.nome}</div>
          <div class="pontos">${p1.pontos} Pts</div>`;
        document.getElementById("podium-1").classList.add("revelado");
      }
    }, 2500);

    setTimeout(() => {
      document.getElementById("resumo-partida").innerHTML = `
        <div class="resumo-item">
            <span>🔄</span>
            <p>${ESTADO_JOGO.partida.rodada} Rodadas</p>
        </div>
        <div class="resumo-item">
            <span>⏱️</span>
            <p>${tempoFormatado}</p>
        </div>
       `;
      document.getElementById("botoes-finais").innerHTML = `
         <button onclick="iniciarNovoJogo(true)" class="btn btn-primary w-full">Jogar Novamente</button>
         <button onclick="finalizarPartida()" class="btn btn-secondary w-full">Voltar ao Início</button>
       `;
    }, 3500);
  }, 1000);
}

function exibirPlacarParcial() {
  if (
    !["discussao"].includes(
      Object.keys(TELAS).find((k) => !TELAS[k].classList.contains("hidden"))
    )
  )
    return;

  ESTADO_JOGO.partida.telaAnterior = Object.keys(TELAS).find(
    (k) => !TELAS[k].classList.contains("hidden")
  );

  const jogadoresOrdenados = [...ESTADO_JOGO.jogadores].sort(
    (a, b) => b.pontos - a.pontos
  );

  resultadosCard.innerHTML = `
    <h2 class="titulo">📊 Placar Parcial</h2>
    <div class="placar-parcial-container">
        ${jogadoresOrdenados
          .map((j, i) => {
            const medalhas = ["🥇", "🥈", "🥉"];
            const posicao = i < 3 ? medalhas[i] : `${i + 1}º`;
            return `
              <div class="ranking-item-parcial">
                  <span class="ranking-posicao-parcial">${posicao}</span>
                  <span class="ranking-nome-parcial">${j.nome}</span>
                  <span class="ranking-pontos-parcial">${j.pontos} Pts</span>
              </div>`;
          })
          .join("")}
    </div>
    <button onclick="voltarParaJogo()" class="btn btn-primary w-full mt-8">Voltar ao Jogo</button>`;

  trocarTela("resultados");
}

function voltarParaJogo() {
  trocarTela(ESTADO_JOGO.partida.telaAnterior);
}

// --- CONTROLES DE FIM DE PARTIDA ---
function finalizarPartida() {
  ESTADO_JOGO.partida.tempoInicioPartida = null;
  trocarTela("inicial");
}

function iniciarNovoJogo(manterJogadores = false) {
  if (!manterJogadores) {
    ESTADO_JOGO.jogadores = [];
    trocarTela("configuracao");
  } else {
    ESTADO_JOGO.jogadores.forEach((j) => (j.pontos = 0));
  }
  // Reseta o estado da partida para um novo jogo
  ESTADO_JOGO.partida = {
    placar: { impostor: 0, cidadao: 0 },
    rodada: 1,
    impostoresReais: 0,
    telaAnterior: "",
    impostoresParaAdivinhar: [],
    impostoresDescobertosNestaRodada: [],
    impostorAdivinhando: null,
    tempoInicioPartida: new Date(), // Reinicia o cronômetro
  };

  if (manterJogadores) {
    sortearRolesEIniciar();
  }
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
  carregarConfiguracao();
  criarBotoesDeSelecao();
  carregarEExibirCategorias();
  carregarEExibirRegras();

  if (popupFecharBtn) popupFecharBtn.addEventListener("click", fecharPopup);
  if (placarDiv) placarDiv.addEventListener("click", exibirPlacarParcial);
    if (btnVoltar) btnVoltar.addEventListener("click", voltarTelaAnterior);
  if (btnFechar) btnFechar.addEventListener("click", () => {
      exibirPopup("Tem certeza que deseja Reiniciar? Todo o progresso será perdido e você irá voltar para a tela inicial.", () => {
          trocarTela('inicial');
      });
  });

  if (btnRegraAnterior)
    btnRegraAnterior.addEventListener("click", () => {
      if (slideAtualRegras > 0) mostrarSlideRegra(slideAtualRegras - 1);
    });
  if (btnRegraProximo)
    btnRegraProximo.addEventListener("click", () => {
      if (slideAtualRegras < totalSlidesRegras - 1)
        mostrarSlideRegra(slideAtualRegras + 1);
    });

  document
    .getElementById("btn-avancar-para-categorias")
    ?.addEventListener("click", () => trocarTela("categorias"));
  document
    .getElementById("btn-avancar-para-nomes")
    ?.addEventListener("click", avancarParaNomes);
  document
    .getElementById("btn-iniciar-partida")
    ?.addEventListener("click", iniciarPartida);

  document
    .getElementById("btn-selecionar-tudo")
    ?.addEventListener("click", () => {
      ESTADO_JOGO.config.categoriasSelecionadas = [
        ...Object.keys(ESTADO_JOGO.todasCategorias),
      ];
      document
        .querySelectorAll(".btn-categoria")
        .forEach((btn) => btn.classList.add("active"));
      salvarConfiguracao();
    });
  document
    .getElementById("btn-limpar-selecao")
    ?.addEventListener("click", () => {
      ESTADO_JOGO.config.categoriasSelecionadas = [];
      document
        .querySelectorAll(".btn-categoria")
        .forEach((btn) => btn.classList.remove("active"));
      salvarConfiguracao();
    });

  trocarTela("inicial");
});
