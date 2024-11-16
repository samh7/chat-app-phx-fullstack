import { useEffect, useState, FormEvent, useRef } from "react";
// @ts-ignore
import { Socket, Channel } from "phoenix"; // Change this import

interface Message {
  user: string;
  message: string;
  timestamp: number;
}

interface Presence {
  [key: string]: {
    metas: Array<{ online_at: string }>;
  };
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>("");
  const [color, setRandomColor] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [presences, setPresences] = useState<Presence>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const navigate = useNavigate();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const randomUsername = "user@" + Math.random().toString(36).substring(2, 8);
    setUsername(randomUsername);
    setRandomColor(randomColor());
    // Generate a random username if not set
    // const randomUsername = Math.random().toString(36).substring(2, 8);
    // setUsername(randomUsername);

    // Connect to Phoenix socket and channel
    const socket = new Socket("ws://localhost:4000/socket");
    socket.connect();

    const channel = socket.channel("room:lobby", { username: randomUsername });

    channel
      .join()
      .receive("ok", (resp: any) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp: any) => {
        console.log("Unable to join", resp);
      });

    // Listen for new messages
    channel.on("new_msg", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Handle presence updates
    channel.on("presence_state", (state: Presence) => {
      setPresences(state);
    });

    channel.on(
      "presence_diff",
      (diff: { joins: Presence; leaves: Presence }) => {
        setPresences((currentPresences) => {
          const newPresences = { ...currentPresences };

          // Handle joins
          Object.keys(diff.joins).forEach((key) => {
            newPresences[key] = diff.joins[key];
          });

          // Handle leaves
          Object.keys(diff.leaves).forEach((key) => {
            delete newPresences[key];
          });

          return newPresences;
        });
      }
    );

    setChannel(channel);

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channel) return;

    channel
      .push("new_message", { message: newMessage })
      .receive("ok", () => {
        setNewMessage("");
      })
      .receive("error", (resp: any) => {
        console.error("Failed to send message:", resp);
      });
  };

  return (
    <div className="flex flex-col h-screen w-full mx-auto p-4">
      <div className="bg-white rounded-t-lg p-4">
        <h1 className="text-2xl font-bold text-gray-800">Chat Room</h1>
        <p className="">
          Welcome,{" "}
          <span className="text-2xl font-bold text-black"> {username}</span>
        </p>
        <div className="text-sm">
          Online Users:{" "}
          <span className="text-gray-500">
            {Object.keys(presences).join(", ")}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50  border border-gray-300 rounded-sm p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.user === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user === username
                    ? `bg-black text-white`
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div
                  className={`font-bold ${
                    message.user === username
                      ? "text-green-400"
                      : "text-red-400"
                  } text-sm`}
                >
                  {message.user === username
                    ? `You: ${message.user}`
                    : message.user}
                </div>
                <div>{message.message}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-b-lg  p-4 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none"
        >
          Send
        </button>
      </form>
    </div>
  );
}

const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}
