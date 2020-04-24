import "phoenix_html";
import { Socket, Presence } from "phoenix";

import css from "../css/app.css"; //import for webpack

import * as d3 from "d3";

const messageDisplay = d3.select("#messagedisplay"); // list of messages.
const msg = document.getElementById("msg"); // message input field

let socket = new Socket("/socket");

socket.connect();

let channelName = "room:subtopic";
let channel = socket.channel(channelName);

channel.join();

let presence = new Presence(channel);

channel.on("shout", (payload) => {
  const maxCount = 10; //todo need to update

  messageDisplay
    .append("text")
    .text(payload.message)
    .attr("x", 100)
    .attr("y", payload.color_id * 80 + 10)
    .attr("fill", d3.interpolateTurbo(payload.color_id))
    .attr("opacity", d3.easeQuadInOut(payload.count / payload.max_count))
    .attr("stroke", "black")
    .attr("stroke-width", 0.1)
    .attr("text-anchor", "start")
    .attr("font-size", ".5em")
    .attr("dominant-baseline", "middle")
    .attr("font-family", "Lucida Console, Monaco, monospace")
    .transition()
    .duration(12000)
    .ease(d3.easeLinear)
    .attr("x", -10)
    .remove();
});

channel.on("color", (payload) => {
  messageDisplay
    .insert("text")
    .text("█")
    .attr("x", 95)
    .attr("id", "cursor")
    .attr("y", payload.id * 80 + 10)
    .attr("fill", d3.interpolateTurbo(payload.id))
    .attr("text-anchor", "start")
    .attr("font-size", ".5em")
    .attr("dominant-baseline", "middle")
    .attr("font-family", "Lucida Console, Monaco, monospace");
});

msg.addEventListener("keydown", shoutMessage);

function shoutMessage() {
  if (msg.value.length > 0) {
    channel.push("shout", { message: msg.value });
    msg.value = "";
  } else {
    setTimeout(shoutMessage, 1);
  }
}
