defmodule SmolchatWeb.UserSocket do
  use Phoenix.Socket

  channel "room:*", SmolchatWeb.RoomChannel

  def connect(_params, socket) do
    {:ok, assign(socket, user_id: nil, color_id: :rand.uniform())}
  end

  def id(socket), do: "users_socket:#{socket.assigns.user_id}"
end
