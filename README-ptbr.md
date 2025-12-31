# 🕵️‍♂️ Impostor - O Jogo

Um jogo de dedução social e blefe para jogar localmente com amigos. Descubra quem é o impostor antes que o tempo acabe!

> **Nota:** Este projeto foi desenvolvido em colaboração com o **Gemini 2.5 Pro**, demonstrando o poder da programação assistida por IA.

## 🎮 Sobre o Jogo

**Impostor** é um jogo para grupos de 3 a 10 pessoas (passando o dispositivo de mão em mão).
* **Cidadãos:** Recebem uma palavra secreta e uma categoria.
* **Impostores:** Recebem apenas a categoria.

O objetivo dos Cidadãos é descobrir quem é o Impostor através de dicas sutis. O objetivo do Impostor é mentir, fingir que sabe a palavra e tentar adivinhá-la se for descoberto.

## ✨ Funcionalidades

* **📱 Responsivo:** Interface adaptada para telemóveis e computadores.
* **⚡ App Instalável (PWA):** Pode ser instalado como uma aplicação nativa no Android/iOS.
* **🎨 Design Moderno:** Estilizado com **Tailwind CSS**, modo escuro (Dark Mode) e animações fluidas.
* **⚙️ Configurável:** Defina número de jogadores (até 10), impostores (1 ou 2) e categorias de palavras.
* **🏆 Sistema de Pontuação:** Ranking automático e pódio animado ao final da partida.

## 🚀 Como Executar

Como o jogo carrega dados externos (`palavras.json`, `regras.json`), é necessário um servidor local para evitar bloqueios de segurança do navegador (CORS).

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/defNickTCys/impostor.git](https://github.com/defNickTCys/impostor.git)
    cd impostor
    ```

2.  **Inicie um servidor local:**
    * **Com Python:**
        ```bash
        python -m http.server 8000
        ```
    * **Com VS Code:** Use a extensão "Live Server".
    * **Com Node.js:**
        ```bash
        npx serve .
        ```

3.  **Jogue:**
    Aceda a `http://localhost:8000` no seu navegador.

## 🛠️ Tecnologias Utilizadas

* **HTML5 Semântico**
* **JavaScript (Vanilla)** - Lógica pura, sem frameworks pesados.
* **Tailwind CSS** - Para estilização rápida e eficiente.
* **FontAwesome** - Ícones da interface.

## 🤖 Colaboração com IA

Este código foi criado em parceria com o **Gemini 2.5 Pro**. A IA auxiliou em etapas cruciais:
* Arquitetura do estado global do jogo em JavaScript.
* Implementação da lógica de votação e verificação de vitória.
* Design da interface responsiva e paleta de cores.
* Criação da base de dados de palavras e regras em JSON.

## 📄 Licença

Projeto de código aberto. Sinta-se à vontade para contribuir ou modificar!
