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
    broadcast socket, "shout", Map.put(payload, :color_id, socket.assigns.color_id)
    {:noreply, socket}
  end

  def handle_in("newname", payload, socket) do

    Presence.update(
      socket,
      socket.assigns.user_id,
      &(%{&1 | displayname: payload["name"]})
    )

    {:noreply, socket} 
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))

    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second)),
      displayname: "anonymous",
      color_id: socket.assigns.color_id
    })

    {:noreply, socket}
  end

end
