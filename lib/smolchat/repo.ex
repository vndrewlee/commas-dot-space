defmodule Smolchat.Repo do
  use Ecto.Repo,
    otp_app: :smolchat,
    adapter: Ecto.Adapters.Postgres
end
