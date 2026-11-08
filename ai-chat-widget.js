(function () {
  if (window.gracioustecChatLoaded) return;
  window.gracioustecChatLoaded = true;

  const SUPABASE_URL =
    "https://iknhifndgpwibkfidggq.supabase.co";

  // INSERT YOUR SUPABASE PUBLISHABLE KEY BELOW
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xELauxOMm7eMkNrPz55Mrw_LVkRoASn";

  const FUNCTION_URL =
    SUPABASE_URL + "/functions/v1/gracioustec-ai-assistant";

  const style = document.createElement("style");

  style.textContent = `
    #gt-chat-button {
      position: fixed;
      right: 20px;
      bottom: 22px;
      z-index: 999999;
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      background: #087f3d;
      color: white;
      font-size: 27px;
      cursor: pointer;
      box-shadow: 0 5px 18px rgba(0,0,0,.25);
    }

    #gt-chat-window {
      display: none;
      position: fixed;
      right: 15px;
      bottom: 95px;
      z-index: 999999;
      width: min(360px, calc(100vw - 30px));
      height: 470px;
      max-height: calc(100dvh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 5px 30px rgba(0,0,0,.22);
      overflow: hidden;
      font-family: Arial, sans-serif;
    }

    #gt-chat-header {
      background: #087f3d;
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #gt-chat-close {
      background: transparent;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }

    #gt-chat-messages {
      height: calc(100% - 135px);
      overflow-y: auto;
      padding: 12px;
      background: #f5f7f6;
    }

    .gt-message {
      padding: 11px 13px;
      margin-bottom: 10px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      max-width: 85%;
    }

    .gt-bot {
      background: white;
      color: #222;
      margin-right: auto;
    }

    .gt-user {
      background: #087f3d;
      color: white;
      margin-left: auto;
    }

    #gt-chat-form {
      display: flex;
      gap: 7px;
      padding: 10px;
      background: white;
      border-top: 1px solid #eee;
    }

    #gt-chat-input {
      flex: 1;
      min-width: 0;
      border: 1px solid #ddd;
      border-radius: 22px;
      padding: 11px;
      font-size: 14px;
      outline: none;
    }

    #gt-chat-send {
      border: none;
      background: #087f3d;
      color: white;
      border-radius: 22px;
      padding: 0 17px;
      cursor: pointer;
    }

    #gt-chat-send:disabled {
      opacity: .6;
      cursor: not-allowed;
    }
  `;

  document.head.appendChild(style);

  const button = document.createElement("button");
  button.id = "gt-chat-button";
  button.type = "button";
  button.innerHTML = "&#128172;";
  button.setAttribute("aria-label", "Open Gracioustec support chat");

  const chat = document.createElement("section");
  chat.id = "gt-chat-window";

  chat.innerHTML = `
    <div id="gt-chat-header">
      <div>
        <strong>Gracioustec Assistant</strong>
        <div style="font-size:12px;margin-top:4px">
          Customer Support
        </div>
      </div>
      <button id="gt-chat-close" type="button">&times;</button>
    </div>

    <div id="gt-chat-messages" aria-live="polite">
      <div class="gt-message gt-bot">
        Hello! Welcome to Gracioustec. How can I help you today?
      </div>
    </div>

    <form id="gt-chat-form">
      <input id="gt-chat-input"
        type="text"
        maxlength="1500"
        placeholder="Type your message..."
        autocomplete="off"
        required>
      <button id="gt-chat-send" type="submit">Send</button>
    </form>
  `;

  document.body.appendChild(button);
  document.body.appendChild(chat);

  const messages = chat.querySelector("#gt-chat-messages");
  const form = chat.querySelector("#gt-chat-form");
  const input = chat.querySelector("#gt-chat-input");
  const send = chat.querySelector("#gt-chat-send");

  let history = [];

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "gt-message " +
      (type === "user" ? "gt-user" : "gt-bot");
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  button.addEventListener("click", function () {
    chat.style.display = "block";
    button.style.display = "none";
    input.focus();
  });

  chat.querySelector("#gt-chat-close").addEventListener(
    "click",
    function () {
      chat.style.display = "none";
      button.style.display = "block";
    }
  );

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = input.value.trim();
    if (!message || send.disabled) return;

    addMessage(message, "user");
    input.value = "";
    send.disabled = true;
    send.textContent = "...";

    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          message: message,
          history: history
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Request failed.");
      }

      if (!result.reply) {
        throw new Error("No response received.");
      }

      addMessage(result.reply, "bot");

      history.push(
        { role: "user", content: message },
        { role: "assistant", content: result.reply }
      );

      history = history.slice(-8);

    } catch (error) {
      console.error("Gracioustec chat error:", error);
      addMessage(
        "Sorry, we could not process your message. Please try again or visit our Contact page.",
        "bot"
      );
    } finally {
      send.disabled = false;
      send.textContent = "Send";
      input.focus();
    }
  });
})();
