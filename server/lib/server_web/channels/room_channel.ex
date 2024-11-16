defmodule ServerWeb.RoomChannel do
  use ServerWeb, :channel
  alias ServerWeb.Presence

  @impl true
  @spec join(<<_::80>>, map(), any()) ::
          {:error, %{reason: <<_::96>>}} | {:ok, Phoenix.Socket.t()}
  def join("room:lobby", %{"username" => username}, socket) do
    if authorized?(%{"username" => username}) do
      send(self(), :after_join)

      {:ok,
       assign(socket, :username, username)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # joins and leaves hanler
  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.username, %{
        # room_id: socket.assigns.room_id,
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # new message handler
  @impl true
  def handle_in("new_message", %{"message" => message}, socket) do
    broadcast!(socket, "new_msg", %{
      # room_id: socket.assigns.room_id,
      user: socket.assigns.username,
      message: message,
      timestamp: :os.system_time(:millisecond)
    })

    {:reply, :ok, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    {:noreply, socket}
  end

  # authorization handler
  defp authorized?(%{"username" => username}) when is_binary(username) do
    true
  end

  defp authorized?(_), do: false
end
