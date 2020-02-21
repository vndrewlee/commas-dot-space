// import css for webpack
import css from "../css/app.css";

import "phoenix_html";
import { Socket, Presence } from "phoenix";

var ul = document.getElementById("msg-canvas"); // list of messages.
var name = document.getElementById("name"); // name of message sender
var msg = document.getElementById("msg"); // message input field
var nameField = document.getElementById("name"); // message input field
let presencePanel = document.getElementById("presence-panel");

let socket = new Socket("/socket", {
  params: { user_id: window.location.search.split("=")[1] }
});

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
  msg.style.position = "absolute";
  msg.style.size = "5rem";
  msg.style.whiteSpace = "nowrap";
  msg.style.left = "200%";
  msg.style.top = "50%";
  // msg.style.top = Math.trunc((Math.random() * 0.6 + 0.2) * 100) + "%";
  // var name = payload.name || "guest"; // get name from payload or set default
  msg.innerHTML = payload.message;

  ul.appendChild(msg); // append to list
  msg.onanimationend = () => msg.remove();
  msg.classList.add("flyer");
});

presence.onSync(() => {
  let response = "";

  presence.list((id, { metas }) => {
    let displayNames = metas.map(x => x.displayname);
    displayNames.sort();
    response = "<li>" + displayNames.join("</li><li>") + "</li>";
  });

  presencePanel.innerHTML = response;
});

msg.addEventListener("keyup", () => {
  channel.push("shout", {
    name: name.value,
    message: msg.value
  });

  msg.value = "";
});

nameField.addEventListener("keyup", () => {
  let newName = nameField.value.length > 0 ? name.value : "anonymous";
  channel.push("newname", { name: newName });
});
