import { FormEvent, useState } from "react";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import { useCookies } from "react-cookie";

export const FlowsPage: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [data, setData] = useState("");
  const [cookies] = useCookies(["auth_root"]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api.post(
        "/root/append-flow",
        { email, data },
        { headers: { Authorization: cookies.auth_root } }
      );
      setData("");
      alert("Enviado com sucesso!");
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Construtores de fluxo
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 w-full items-baseline">
          <input
            value={email}
            onChange={(s) => setEmail(s.target.value)}
            type="text"
            placeholder="Digite o email da conta"
            className="p-2"
          />
          <textarea
            name=""
            id=""
            placeholder="Apenas o DATA do fluxo"
            className="p-2 w-full"
            value={data}
            onChange={(s) => setData(s.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-green-300 hover:bg-green-400 duration-200 p-2"
        >
          ENVIAR
        </button>
      </form>
    </div>
  );
};
