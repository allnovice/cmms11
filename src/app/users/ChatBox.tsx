// src/app/users/ChatBox.tsx
"use client";
import { useState, useEffect } from "react";
import { rtdb } from "@/firebase";
import { ref, push, onValue } from "firebase/database";
import "./chatbox.css";  // <-- import your isolated chatbox CSS

export default function ChatBox({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const chatRef = ref(rtdb, "chat");
    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(data ? Object.values(data) as any : []);
    });
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    push(ref(rtdb, "chat"), { user: userName, text: newMessage });
    setNewMessage("");
  };

  return (
    <div className="chatbox">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.user}:</strong> {msg.text}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
    </div>
  );
}
