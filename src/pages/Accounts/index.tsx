import { FormEvent, useState } from "react";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import { useCookies } from "react-cookie";

export const AccountsPage: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [cookies] = useCookies(["auth_root"]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api.put(
        "/root/account-to-premium",
        { email },
        { headers: { Authorization: cookies.auth_root } }
      );
      alert("Conta atualiza com sucesso!");
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Contas
      </h2>

      <form onSubmit={submit} className="flex gap-x-3">
        <input
          value={email}
          onChange={(s) => setEmail(s.target.value)}
          type="text"
          placeholder="Digite o email da conta"
        />
        <button type="submit">Tornar Premium</button>
      </form>
    </div>
  );
};
