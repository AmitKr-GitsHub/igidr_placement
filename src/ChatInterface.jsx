import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const ROOM_TYPES = {
  ADMIN_PLACECOM: "ADMIN_PLACECOM",
  PLACECOM_ONLY: "PLACECOM_ONLY",
  DM: "DM",
};

const ROOM_OPTIONS = [
  {
    key: ROOM_TYPES.ADMIN_PLACECOM,
    label: "Admin & Placecom",
    roomId: 1,
  },
  {
    key: ROOM_TYPES.PLACECOM_ONLY,
    label: "Placecoms",
    roomId: 2,
  },
  {
    key: ROOM_TYPES.DM,
    label: "DMs",
    roomId: 3,
  },
];

export default function ChatInterface({
  serverUrl = "http://localhost:3000",
  senderId = 1,
  className = "",
}) {
  const [selectedRoom, setSelectedRoom] = useState(ROOM_OPTIONS[0]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const listRef = useRef(null);

  const roomTitle = useMemo(() => selectedRoom.label, [selectedRoom]);

  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setError("");
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("socketError", (payload) => {
      setError(payload?.error || "Socket error occurred.");
    });

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedRoom) return;

    setMessages([]);
    setError("");

    socket.emit(
      "joinRoom",
      {
        roomId: selectedRoom.roomId,
        roomType: selectedRoom.key,
      },
      (ack) => {
        if (!ack?.success) {
          setError(ack?.error || "Unable to join room.");
        }
      },
    );
  }, [selectedRoom]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    const socket = socketRef.current;
    const content = inputValue.trim();

    if (!socket || !content) return;

    setError("");

    socket.emit(
      "sendMessage",
      {
        roomId: selectedRoom.roomId,
        roomType: selectedRoom.key,
        senderId,
        content,
        isAgentGenerated: false,
      },
      (ack) => {
        if (!ack?.success) {
          setError(ack?.error || "Failed to send message.");
        }
      },
    );

    setInputValue("");
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={`flex h-[80vh] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow ${className}`}
    >
      <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Room Types
        </h2>
        <div className="space-y-2">
          {ROOM_OPTIONS.map((room) => (
            <button
              key={room.key}
              type="button"
              onClick={() => setSelectedRoom(room)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                selectedRoom.key === room.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              {room.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Status: <span className="font-medium">{status}</span>
        </p>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">{roomTitle}</h1>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </header>

        <main
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto bg-gray-100 p-4"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              No messages yet. Start the conversation.
            </p>
          ) : (
            messages.map((msg) => (
              <article
                key={`${msg.id}-${msg.timestamp}`}
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm shadow ${
                  msg.isAgentGenerated
                    ? "bg-purple-100 text-purple-900"
                    : Number(msg.senderId) === Number(senderId)
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-white text-gray-900"
                }`}
              >
                <p className="mb-1 text-xs opacity-80">
                  {msg.senderName ||
                    (msg.isAgentGenerated
                      ? "AI Agent"
                      : `User ${msg.senderId}`)}
                </p>
                <p>{msg.content}</p>
              </article>
            ))
          )}
        </main>

        <footer className="border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Type a message... (use @agent to trigger AI)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
            />
            <button
              type="button"
              onClick={sendMessage}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
