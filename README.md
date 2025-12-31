# 🕵️‍♂️ Impostor - The Game

A local multiplayer social deduction game built for the web. Gather your friends, hide your identity, and find the Impostor!

> **Note:** This project was developed in collaboration with **Gemini 2.5 Pro**, serving as a demonstration of AI-assisted web development.

## 🎮 About the Game

**Impostor** is a game of bluffing and deduction for 3 to 10 players.
* **Citizens** receive a secret word and a category.
* **Impostors** only receive the category.

The goal of the Citizens is to identify the Impostor through subtle clues. The Impostor's goal is to blend in and guess the secret word before being caught.

## ✨ Features

* **📱 Fully Responsive:** Works perfectly on mobile, tablet, and desktop.
* **⚡ PWA Support:** Installable as a native app on mobile devices via `manifest.json`.
* **🎨 Dynamic UI:** Built with **Tailwind CSS** and custom animations.
* **⚙️ Customizable:** Choose the number of players, impostors, and specific word categories.
* **🖼️ Visual Assets:** Uses SVG animations (Lottie/JSON style structure) for role reveals.

## 🚀 How to Run Locally

Since this project fetches JSON files (`palavras.json`, `regras.json`), you need a local server to avoid CORS (Cross-Origin Resource Sharing) policies.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/defNickTCys/impostor.git](https://github.com/defNickTCys/impostor.git)
    cd impostor
    ```

2.  **Start a local server:**
    * **Using Python 3:**
        ```bash
        python -m http.server 8000
        ```
    * **Using VS Code:** Install the "Live Server" extension and click "Go Live".
    * **Using Node/NPM:**
        ```bash
        npx serve .
        ```

3.  **Play:**
    Open your browser and navigate to `http://localhost:8000`.

## 🛠️ Technologies Used

* **HTML5 & CSS3**
* **JavaScript (ES6+)** - No frameworks, pure logic.
* **Tailwind CSS** (via CDN) - For styling.
* **FontAwesome** - For icons.
* **JSON** - For data storage (words, categories, and rules).

## 🤖 AI Collaboration

This code was co-authored with **Gemini 2.5 Pro**. The collaboration focused on:
* Designing the state management logic (`ESTADO_JOGO`).
* Implementing the game loop (Setup -> Reveal -> Discussion -> Voting).
* Creating the responsive layout with Tailwind CSS.
* Structuring the JSON data for scalability.

## 📄 License

This project is open-source. Feel free to fork and modify!
