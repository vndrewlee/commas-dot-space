defmodule SmolchatWeb.Router do
  use SmolchatWeb, :router

  pipeline :browser do
    plug :accepts, ["html", "text"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/", SmolchatWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/rooms/:id", PageController, :show
  end

end
