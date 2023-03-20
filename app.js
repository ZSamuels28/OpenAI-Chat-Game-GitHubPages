// Select DOM elements
const terminal = document.querySelector(".terminal");
const terminalText = document.querySelector(".terminal-text");
const form = document.querySelector("form");
const userInput = document.querySelector("#user-input");
const buttons = document.querySelectorAll(".button-container button");
var OPENAI_API_KEY = "";
let gameType = "mystery";

window.onload = function() {
  while (OPENAI_API_KEY == "") {
    OPENAI_API_KEY = window.prompt("Enter OpenAI API Key", "");
  }
  if (OPENAI_API_KEY != null) {
    return;
  } else {
    var errorText = document.createElement("span");
    errorText.textContent = "Error - No Key Entered. Please refresh to enter key.";
    errorText.style.color = "#FF0000";
    terminalText.appendChild(errorText);
  }
}

const games = {
  rpg: {
    message:
      "<p>Knight's Mentor: Hark ye! Be ready for a wondrous RPG quest in The Kingdom of Aranthia. Discover vast world with thrilling quests and curious folk. Your choices will shape thy fate. So go forth and embrace thy destiny!</p>",
    prefix: "Knight: ",
  },
  mystery: {
    message:
      "<p>Patron: Mr. Stevens has been murdered! I saw someone running, but I couldn't see them very well. The only people who were around Mr. Stevens were his butler, his housekeeper, his gardener, and his friend. Please, you must help find out who did the crime.</p>",
    prefix: "Investigator: ",
  },
  escape: {
    message:
      "<p>Guide: Welcome and congratulations on making it this far. I am the escape room game, and I hold the key to your freedom. Ask me anything you'd like about the room and its mysteries, and I'll do my best to guide you towards the exit. Are you ready to begin?</p>",
    prefix: "You: ",
  },
};

function selectGame(game) {
  terminalText.innerHTML = games[game].message;
  gameType = game;
  userInput.focus();
  scrollToBottom();
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    selectGame(["mystery", "rpg", "escape"][index]);
  });
});

userInput.focus();

// Scroll the terminal to the bottom
function scrollToBottom() {
  terminal.scrollTop = terminal.scrollHeight;
}

// Print a text reply letter by letter
function printTextReply(reply) {
  const speaker =
    gameType === "mystery"
      ? "Patron"
      : gameType === "rpg"
      ? "Knight's Mentor"
      : "Guide";
  terminalText.insertAdjacentHTML("beforeend", `${speaker}: `);
  let i = 0;
  const intervalId = setInterval(() => {
    // Print each letter of the reply
    terminalText.insertAdjacentHTML("beforeend", reply[i]);
    scrollToBottom();
    i++;
    // Stop the interval when the whole reply has been printed
    if (i === reply.length) {
      clearInterval(intervalId);
    }
  }, 40);
}

// Handle the form submission
form.addEventListener("submit", (event) => {
  const previousChat = terminalText.innerHTML;
  event.preventDefault();
  const input = userInput.value;
  // Do not do anything if the input is empty
  if (input === "") return;

  // Add user's input to the terminal
  const prefix =
    games[gameType ? "mystery" : gameType ? "rpg" : "escape"].prefix;
  const userMessage = `<p>${prefix}${input}</p>`;
  terminalText.insertAdjacentHTML("beforeend", userMessage);
  scrollToBottom();
  // Clear user input
  userInput.value = "";

  if (gameType == "rpg") {
      GameContent = "You are a vast open-world RPG game that takes place in medieval times. The world is called The Kingdom of Aranthia. The user playing is a knight. The game should feature a unique and immersive storyline with multiple endings and a variety of side quests that provide depth to the world and its inhabitants. Task: You will act like a game AT ALL TIMES. Please act like this and respond to my prompts. Speak in medieval language. Do NOT deviate from this.";
  } 
  else if (gameType == "mystery") {
      GameContent = "You are chat game. There has been a murder of Mr. Stevens. One of the following people has committed the crime: Butler, Housekeeper, Gardener, Friend. You were a witness to a murder but are reluctant to discuss it or say what you saw. The person asking you questions is the investigator. Task: You will act like a game AT ALL TIMES. You will speak as a street person in olden times. PLEASE MAKE THIS GAME ENTERTAINING WHILE ANSWERING QUESTIONS AND LET ME GUESS WHO DID THE MURDER. You know who did the murder.";
  } 
  else if (gameType == "escape") {
      GameContent = "You are an escape room game. Only you know the way out. Please help the user get out as they ask you questions about various items and mysteries in the escape room.";
  }

// Send user's input to the server and get response from ChatGPT
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + OPENAI_API_KEY,
};
const requestBody = {
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: GameContent + " The previous chat for the game was: " + previousChat,
    },
    {
      role: "user",
      content: input,
    },
  ],
};
fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: headers,
  body: JSON.stringify(requestBody),
})
.then((response) => response.text())
.then((data) => {
  // Add ChatGPT's response to the terminal
  const chatGPTMessage = `${JSON.parse(data).choices[0].message.content}`;
  printTextReply(chatGPTMessage);
  scrollToBottom();
})
.catch((error) => 
{
  console.error(error);
  var errorText = document.createElement("span");
  errorText.textContent = "Error - Your API key may be invalid or inactive. Please check the developer console for more details or refresh and try again.";
  errorText.style.color = "#FF0000";
  terminalText.appendChild(errorText);
});
});

