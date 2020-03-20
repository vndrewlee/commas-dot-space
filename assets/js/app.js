import "phoenix_html";
import { Socket, Presence } from "phoenix";

// import css for webpack
import css from "../css/app.css";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { interpolateTurbo } from "d3-scale-chromatic";
import { color } from "d3-color";

var messageCanvas = document.getElementById("msg-canvas"); // list of messages.
var name = document.getElementById("name"); // name of message sender
var msg = document.getElementById("msg"); // message input field
var nameField = document.getElementById("name"); // message input field
let presencePanel = document.getElementById("presence-panel");

let socket = new Socket("/socket");

socket.connect();

let subtopic = location.href
  .split("/")
  .slice(-1)[0]
  .split("?")
  .slice(0)[0];
let channelName = "room:" + subtopic;
let channel = socket.channel(channelName);

channel.join();

let presence = new Presence(channel);

channel.on("shout", function(payload) {
  let msg = document.createElement("p");
  msg.classList.add("message");

  let c = color(interpolateTurbo(payload.color_id));
  c.opacity = 0.3;
  msg.style.backgroundColor = c;
  msg.innerHTML = payload.message;
  msg.style.top = payload.color_id * 5 + 45 + "%"; // jitter

  let tick = document.createElement("div");
  tick.classList.add("square");
  c.opacity = 0.1;
  let startColor = c.formatRgb();
  c.opacity = 0;
  let endColor = c.formatRgb();
  tick.style.backgroundImage =
    "linear-gradient(to right, " + startColor + ", " + endColor + ")";

  messageCanvas.appendChild(msg);
  messageCanvas.appendChild(tick);

  msg.onanimationend = () => msg.remove();
  tick.onanimationend = () => tick.remove();
  msg.classList.add("flyer");
  tick.classList.add("flyerslow");
});

presence.onSync(() => {
  let response = "";

  presence.list((id, { metas }) => {
    let listItems = metas.map(meta => {
      let c = color(interpolateTurbo(meta.color_id));
      c.opacity = 0.3;
      let listItemComponents = [
        '<li style="background-color:',
        c,
        '">',
        meta.displayname,
        "</li>"
      ];
      return listItemComponents.join("");
    });

    response = listItems.join("");
  });

  presencePanel.innerHTML = response;
});

msg.addEventListener("keydown", shoutMessage);

function shoutMessage() {
  if (msg.value.length > 0) {
    channel.push("shout", { name: name.value, message: msg.value });
    msg.value = "";
  } else {
    setTimeout(shoutMessage, 1);
  }
}

nameField.addEventListener("keyup", () => {
  let newName = nameField.value.length > 0 ? name.value : "anonymous";
  channel.push("newname", { name: newName });
});
