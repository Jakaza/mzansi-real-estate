import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({ chats, defaultChatId }) {

  const [chat, setChat] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const messageEndRef = useRef();
  const decrease = useNotificationStore((state) => state.decrease);

  useEffect(() => {
    const r = getOtherUser();
    setReceiver(r);
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  
  useEffect(() => {
    if (defaultChatId) {
      handleOpenChat(defaultChatId);
    }
  }, [defaultChatId]);

  const handleOpenChat = async (chatId) => {
    try {
      const res = await apiRequest(`/chats/${chatId}`);

      setChat(res.data);

      if (res.data && res.data.seenBy && !res.data.seenBy.includes(currentUser.id)) {
        decrease();
      }
      setChat(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text) return;

    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data]
      }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver?.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };


  const getOtherUser = () => {
    if (!chat || !chat.users) return null;
    return chat.users.find((user) => user.id !== currentUser.id);
  };

  useEffect(() => {
    const read = async () => {
      try {
        if (chat && chat.id) {
          await apiRequest.put(`/chats/read/${chat.id}`);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setChat((prev) => ({
            ...prev,
            messages: [...prev.messages, data]
          }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id)}
          >
            <img src={c.receiver?.avatar || "/noavatar.jpg"} alt="" />
            <span>{c.receiver?.username || "Unknown"}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver?.avatar || "/noavatar.jpg"} alt="" />
              {receiver?.username || "Unknown"}
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text" placeholder="Type a message..."></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
