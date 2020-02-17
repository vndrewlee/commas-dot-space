// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html";

import socket from "./socket";

let subtopic = location.href.split("/").slice(-1)[0];
let channelName = "room:" + subtopic;
let channel = socket.channel(channelName);

channel.on("shout", function(payload) {
  // listen to the 'shout' event
  let msg = document.createElement("p");
  msg.style.position = "absolute";
  msg.style.size = "5rem";
  msg.style.whiteSpace = "nowrap";
  msg.style.left = "200%";
  msg.style.top = "50%";
  // msg.style.top = Math.trunc((Math.random() * 0.6 + 0.2) * 100) + "%";
  // var li = document.createElement("li"); // creaet new list item DOM element
  var name = payload.name || "guest"; // get name from payload or set default
  // msg.innerHTML = "<b>" + name + "</b>: " + payload.message;
  msg.innerHTML = payload.message;

  ul.appendChild(msg); // append to list
  msg.onanimationend = () => msg.remove();
  msg.classList.add("flyer");

  // li.scrollIntoView();
});

channel
  .join()
  .receive("ok", resp => {
    console.log("Joined successfully", resp);
  })
  .receive("error", resp => {
    console.log("Unable to join", resp);
  });

var ul = document.getElementById("msg-canvas"); // list of messages.
var name = document.getElementById("name"); // name of message sender
var msg = document.getElementById("msg"); // message input field

// "listen" for the [Enter] keypress event to send a message:
msg.addEventListener("keypress", function(event) {
  if (event.keyCode == 13 && msg.value.length > 0) {
    // don't sent empty msg.
    channel.push("shout", {
      // send the message to the server
      name: name.value, // get value of "name" of person sending the message
      message: msg.value // get message text (value) from msg input field.
    });
    msg.value = ""; // reset the message input field for next message.
  }
});
