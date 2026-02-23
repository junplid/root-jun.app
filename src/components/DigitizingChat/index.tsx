"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import autoAnimate from "@formkit/auto-animate";
// o component iria simular um chat

import { Typewriter } from "react-simple-typewriter";
import clsx from "clsx";
import { slideFade } from "./autoAnimation";
import { RiSendPlane2Line } from "react-icons/ri";
import { AiOutlineAudio } from "react-icons/ai";

interface Props {
  list: (
    | { type: "lead" | "ia"; value: string }
    | { type: "sleep"; sleep: number }
  )[];
}

const TYPE_SPEED = 49;

export default function DigitizingChatComponent(props: Props) {
  const parent = useRef(null);
  const [messages, setMessages] = useState<
    { value: string; by: "ia" | "lead"; key: string }[]
  >([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState<string>("");
  const [clicksend, setClicksend] = useState(false);

  useEffect(() => {
    async function start() {
      for await (const data of props.list) {
        if (data.type === "lead") {
          setInput(data.value);
          await new Promise((s) =>
            setTimeout(s, data.value.length * TYPE_SPEED + 200),
          );
          setClicksend(true);
          setInput("");
          await new Promise((s) => setTimeout(s, 90));
          setMessages((state) => [
            ...state,
            { by: "lead", key: nanoid(), value: data.value },
          ]);
          setTimeout(() => {
            setClicksend(false);
          }, 200);
        }
        if (data.type === "ia") {
          if (data.value.length > 5) {
            setTyping(true);
            await new Promise((s) =>
              setTimeout(s, data.value.length * TYPE_SPEED + 100),
            );
            setTyping(false);
          }
          setMessages((state) => [
            ...state,
            { by: "ia", key: nanoid(), value: data.value },
          ]);
        }
        if (data.type === "sleep" && data.sleep) {
          await new Promise((s) => setTimeout(s, data.sleep!));
        }
      }
    }

    const debounce = setTimeout(() => {
      start();
    }, 2000);

    return () => {
      clearTimeout(debounce);
      setInput("");
      setMessages([]);
      setTyping(false);
      setClicksend(false);
    };
  }, [props.list]);

  useEffect(() => {
    parent.current && autoAnimate(parent.current, slideFade);
  }, [parent]);

  return (
    <div
      style={{ overflowAnchor: "none" }}
      className="flex relative flex-col gap-2 justify-end bg-[#2d2a2a] h-120 rounded-br-[38px] rounded-bl-[38px] overflow-hidden z-10"
    >
      <div className="bg-[linear-gradient(180deg,rgba(24,22,22,1)4%,rgba(24,22,22,0)100%)] z-10 absolute top-0 left-0 w-full min-h-44"></div>
      <div
        ref={parent}
        className="flex-1 flex gap-y-3 flex-col p-3 h-full justify-end overflow-hidden"
      >
        {messages.map((msg, index) => {
          let is = false;
          if (messages[index - 1] !== undefined) {
            is = msg.by === messages[index - 1].by;
          }
          return (
            <div
              key={msg.key}
              className="flex items-start gap-x-1.5 duration-300"
            >
              {msg.by === "ia" && !is && (
                <div className="h-6 w-6 bg-[#D1FFED]/50 rounded-full flex items-center justify-center font-bold">
                  IA
                </div>
              )}
              <div
                className={clsx(
                  " p-2 rounded-xl",
                  msg.by === "lead"
                    ? "bg-[#3d3a3a] max-w-2/3 text-start mx-auto mr-0"
                    : `border border-white/60 bg-[linear-gradient(130deg,rgba(171,200,185,1)17%,rgba(132,189,163,1)100%)] font-medium text-black max-w-2/3 ${
                        is ? "ml-7.5 -mt-2" : ""
                      }`,
                )}
              >
                <span>{msg.value}</span>
              </div>
            </div>
          );
        })}
      </div>
      {typing && (
        <span className="text-sm px-3 text-white/45 animate-typing">
          digitando...
        </span>
      )}

      {/* input */}
      <div className="px-3.5 pb-3.5">
        <div className="border-white/5 border bg-[#3d3a3a] shadow-xl rounded-full flex items-center justify-between gap-2">
          <div className="flex-1 flex items-center pl-4 w-full min-h-14 ">
            {input && <Typewriter words={[input]} typeSpeed={TYPE_SPEED} />}
          </div>
          <div className="flex items-center gap-x-2 pl-2 pr-3.5">
            <RiSendPlane2Line
              size={36}
              className={clsx(
                "bg-gray-300/15 p-2 rounded-full duration-200",
                clicksend ? "animate-click bg-gray-300/25" : "",
              )}
            />
            <AiOutlineAudio
              size={36}
              className="bg-gray-300/15 p-2 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
