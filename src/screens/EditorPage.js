import React, { useEffect, useRef, useState } from "react";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Room ID has been copied.");
    } catch (error) {
      toast.err("Failed to copy roomid");
    }
  };

  function leaveRoom() {
    navigate("/");
  }

  useEffect(() => {
    async function init() {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        toast.error("Socket connection failed");
        navigate("/");
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId: id,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username != location.state.username) {
            toast.success(`${username} joined the room.`);
          }
          setclients(clients);

          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setclients((prev) => {
          return prev.filter((client) => client.socketId != socketId);
        });
      });
    }
    init();

    return () => {
      socketRef.current.off(ACTIONS.JOIN);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);

  const [clients, setclients] = useState([]);

  if (!location.state) {
    return <Navigate to="/" />;
  }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div children="asideInner">
          
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => {
              return (
                <Client
                  className="client"
                  key={client.socketId}
                  username={client.username}
                />
              );
            })}
          </div>
        </div>
        <div>
          <button className="btn copyBtn" onClick={copyRoomId}>
            Copy Room Id
          </button>
          <button className="btn leaveBtn" onClick={leaveRoom}>
            Leave
          </button>
        </div>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={id}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
