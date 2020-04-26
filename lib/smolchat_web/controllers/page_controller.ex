defmodule SmolchatWeb.PageController do
  use SmolchatWeb, :controller

  def index(conn, _params) do
    conn
    |> put_resp_header("cache-control", "no-store")
    |> put_resp_header("vary", "*")
    |> render(:index)
  end

  def about(conn, _params) do
    conn
    |> render("about.html")
  end
end
