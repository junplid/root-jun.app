import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { Socket, Manager } from "socket.io-client";
import { SocketContext } from "./contexts";

type TStateSocket = "loading" | "disconnected" | "connected";

export interface PropsSocketContext_I {
  socket: Socket;
  ns: (namespace: string, opts?: any) => Socket;
}

interface PropsProviderSocketContext_I {
  children: JSX.Element;
}

export const SocketProvider = ({
  children,
}: PropsProviderSocketContext_I): JSX.Element => {
  const [_stateSocket, setStateSocket] = useState<TStateSocket>("loading");
  const audioOrderRef = useRef<HTMLAudioElement | null>(null);

  const manager = useMemo(() => {
    return new Manager(import.meta.env.VITE_API.split("/v1")[0], {
      timeout: 3000,
      autoConnect: true,
    });
  }, []);

  const socket = useMemo(
    () => manager.socket("/", { auth: { rootId: 1 } }),
    [manager]
  );

  const ns = (nsp: string, opts = {}) => manager.socket(nsp, { ...opts });

  useEffect(() => {
    socket.on("connect_error", () => setStateSocket("disconnected"));
    socket.on("connect", () => setStateSocket("connected"));
    return () => {
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [socket]);

  const dataValue = useMemo(() => {
    return { socket: socket, ns };
  }, [socket]);

  return (
    <SocketContext.Provider value={dataValue}>
      <audio
        className="hidden"
        ref={audioOrderRef}
        src="/audios/notify-fade-in.mp3"
      />
      {children}
    </SocketContext.Provider>
  );
};
