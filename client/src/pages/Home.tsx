import { useRef, useState } from "react";
import image from "../assets/510858.jpg";
export default function Home() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  return (
    <div className="w-full h-screen flex">
      <div className="w-0 md:w-1/2 md:p-5 grid place-items-center bg-[#444444] transition-all ease-in-out duration-500">
        <img
          className="min-w-[300px] w-[500px] object-cover"
          src={image}
          alt="image"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center gap-4">
        <h1 className="w-[300px] justify-start text-[27px] font-bold">
          the Chat Room
        </h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="room">Room</label>
          <input
            defaultValue={"room:chat"}
            disabled
            ref={roomRef}
            onChange={(e) => {
              setRoom(e.target.value);
            }}
            type="text"
            id="room"
            className="w-[300px] p-2 rounded-sm border border-gray-300"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Name</label>
          <input
            defaultValue={"random()"}
          disabled
            ref={nameRef}
            onChange={(e) => {
              setName(e.target.value);
            }}
            type="text"
            id="name"
            className="w-[300px] p-2 rounded-sm border border-gray-300"
          />
        </div>

        <a
          href={`/chat?room=${"default"}&name=${"random"}`}
          className="w-[300px] grid place-items-center p-2 rounded-sm bg-black text-white"
        >
          Join
        </a>
      </div>
    </div>
  );
}
