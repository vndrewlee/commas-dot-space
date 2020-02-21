defmodule SmolchatWeb.UserSocket do
  use Phoenix.Socket

  channel "room:*", SmolchatWeb.RoomChannel

  # See `Phoenix.Token` for performing token verification on connect.
  def connect(params, socket, _connect_info) do
    {:ok, assign(socket, :user_id, params["user_id"])}
  end

  def id(_socket), do: nil # Returning `nil` makes this socket anonymous. 
  
end

