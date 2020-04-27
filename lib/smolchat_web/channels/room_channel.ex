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
      |> Map.put(:lifespan, 1.0)
      |> Map.put("message", String.slice(payload["message"], 0..0))

    loop(socket, hydrated_payload)
    {:noreply, socket}
  end

  def loop(socket, payload) do
    presence_list = SmolchatWeb.Presence.list("room:subtopic")[""][:metas]
    no_connections = presence_list == nil

    cond do
      payload.lifespan < 0.0 ->
        :ok

      no_connections ->
        :timer.apply_after(
          12000,
          SmolchatWeb.RoomChannel,
          :loop,
          [socket, payload]
        )

      true ->
        broadcast(socket, "shout", payload)

        presence_count = length(presence_list)
        raw_fade = presence_count * 0.05
        capped_fade = if raw_fade > 1, do: 0.99, else: raw_fade
        updated_payload = Map.put(payload, :lifespan, payload.lifespan - capped_fade)

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
