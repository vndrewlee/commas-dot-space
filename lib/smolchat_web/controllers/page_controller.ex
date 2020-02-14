defmodule SmolchatWeb.PageController do
  use SmolchatWeb, :controller

  def index(conn, _params) do
    conn
    # |> put_flash(:info, "heyyyyyyyyyyyy")
    # |> put_flash(:error, "Let's pretend we have an error.")
    # |> put_layout("admin.html")
    # |> assign(:id, "lobby")
    |> render(:index)
  end

  def show(conn, %{"id" => id}) do
    conn
    |> assign(:id, id)
    |> render("room.html")
  end

end
