import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

// Path to store chat history
const HISTORY_FILE = path.join(process.cwd(), 'chat_history.json');

// Variable pour conserver l'historique du chat
let chatSession = null;

// Fonction pour sauvegarder l'historique des chats
function saveChatHistory(history) {
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history), 'utf8');
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'historique:", error);
    }
}

// Fonction pour charger l'historique des chats
function loadChatHistory() {
    try {
      if (fs.existsSync(HISTORY_FILE)) {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
    return null;
  }
  

// Initialise le chat avec le contexte du hamster des poussières
async function initializeChat() {
    const savedHistory = loadChatHistory();
    console.log("Historique chargé:", savedHistory);
    chatSession = model.startChat({
            generationConfig,
            history: savedHistory,
    });
    return chatSession;
}

export async function runGeminiChat(userInput) {
    try {
      // S'assurer que la session de chat est initialisée
      const chat = await initializeChat();   
      
      // Envoyer le message de l'utilisateur et obtenir la réponse
      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      const responseText = response.text();
      
      // Load history from local storage
      let currentHistory = loadChatHistory();
      
      // Add the new chats to this json
      currentHistory.push(
        { role: "user", parts: [{ text: userInput }] },
        { role: "model", parts: [{ text: responseText }] }
      );

      // Save the updated history
      saveChatHistory(currentHistory);
      
      return responseText;
    } catch (error) {
      console.error("Erreur dans runGeminiChat:", error);
      throw error; // Propager l'erreur pour la gérer dans index.js
    }
}