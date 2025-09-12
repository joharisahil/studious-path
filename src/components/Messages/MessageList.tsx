import { useState } from "react";

const MessageList = () => {
  const [messages] = useState([
    { id: 1, sender: "Admin", text: "Welcome to the school portal!" },
    { id: 2, sender: "Admin", text: "Tomorrow is a holiday." },
  ]);

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="p-3 border rounded-md bg-white shadow-sm"
        >
          <strong>{msg.sender}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
