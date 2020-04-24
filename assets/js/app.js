import "phoenix_html";
import { Socket, Presence } from "phoenix";
import css from "../css/app.css"; //import for webpack
import * as d3 from "d3";

const messageDisplay = d3.select("#messagedisplay"); // list of messages.
messageDisplay.on("click", () => document.getElementById("input").focus());
const input = document.getElementById("input"); // message input field

let socket = new Socket("/socket");
socket.connect();
let channelName = "room:subtopic";
let channel = socket.channel(channelName);
channel.join();

channel.on("shout", (payload) => {
  messageDisplay
    .append("text")
    .classed("message", true)
    .text(payload.message)
    .attr("x", 100)
    .attr("y", payload.color_id * 80 + 10)
    .attr("fill", d3.interpolateTurbo(payload.color_id))
    .attr("opacity", d3.easeQuadInOut(payload.count / payload.max_count))
    .transition()
    .duration(12000 * 1.1)
    .ease(d3.easeLinear)
    .attr("x", -10)
    .remove();
});

channel.on("color", (payload) => {
  d3.select("#msgobj")
    .attr("y", payload.id * 80 + 10)
    .attr("x", 0);

  d3.select("#input")
    .style("color", d3.interpolateTurbo(payload.id))
    .style("caret-color", d3.interpolateTurbo(payload.id));

  document.getElementById("input").focus();
});

input.addEventListener("input", (event) => {
  if (
    event.isComposing ||
    event.inputType == "insertFromComposition" ||
    event.inputType == "insertCompositionText" ||
    event.inputType == "deleteCompositionText"
  ) {
    // pass
  } else {
    shoutMessage();
  }
});

input.addEventListener("compositionend", shoutMessage);

function shoutMessage() {
  channel.push("shout", { message: input.value });
  input.value = "";
}
