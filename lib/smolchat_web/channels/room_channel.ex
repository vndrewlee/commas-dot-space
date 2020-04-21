defmodule SmolchatWeb.RoomChannel do
  use SmolchatWeb, :channel
  alias SmolchatWeb.Presence

  def join("room:" <> _private_room_id, _payload, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("shout", payload, socket) do
    hydrated_payload =
      Map.put(payload, :color_id, socket.assigns.color_id)
      |> Map.put(:count, 10)
      |> Map.replace("message", String.slice(payload["message"], 0..0))

    broadcast(socket, "shout", hydrated_payload)

    loop(socket, hydrated_payload)

    {:noreply, socket}
  end

  def loop(socket, payload) do
    if payload.count > 0 do
      broadcast socket, "shout", payload

      presence_list = SmolchatWeb.Presence.list("room:subtopic")[""][:metas]
      no_connections = presence_list == nil
      presence_count = if no_connections, do: 0, else: length presence_list

      updated_payload = Map.replace(payload, :count, payload.count-presence_count)

      :timer.apply_after(
        12000,
        SmolchatWeb.RoomChannel,
        :loop,
        [socket, updated_payload]
      )
    end

    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do

    push(socket, "color", %{:id => socket.assigns.color_id})

    push(socket, "presence_state", Presence.list(socket))

    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: inspect(System.system_time(:second)),
        displayname: "anonymous",
        color_id: socket.assigns.color_id
      })

    {:noreply, socket}
  end

  def terminate(_1, _b) do
    :ok
  end
end
