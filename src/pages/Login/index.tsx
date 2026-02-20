import { AxiosError } from "axios";
import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { FiMail, FiLock } from "react-icons/fi";

interface PropsLogin {
  email: string;
  password: string;
}

export const LoginPage: FC = (): JSX.Element => {
  const [load, setLoad] = useState<boolean>(false);
  const [s, setS] = useState<boolean>(false);
  const [fields, setFields] = useState<PropsLogin>({
    email: "",
    password: "",
  } as PropsLogin);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const login = useCallback(async (props: PropsLogin) => {
    try {
      setLoad(true);
      setError("");
      const { data, status } = await api.post(`/public/login`, props);
      if (status === 200) {
        if (data.csrfToken) {
          api.defaults.headers.common["X-XSRF-TOKEN"] = data.csrfToken;
        }
        setTimeout(() => navigate("/", { replace: true }), 500);
      }
    } catch (error) {
      setLoad(false);
      if (error instanceof AxiosError) {
        setError(
          error.response?.data.details?.[0]?.message || "Erro ao fazer login",
        );
        return;
      }
      setError("Erro inesperado ao fazer login");
    }
  }, []);

  const register = useCallback(async (props: PropsLogin) => {
    try {
      setLoad(true);
      setError("");
      const { data, status } = await api.post(`/public/register-root`, props);
      if (status === 200) {
        if (data.csrfToken) {
          api.defaults.headers.common["X-XSRF-TOKEN"] = data.csrfToken;
        }
        setTimeout(() => navigate("/", { replace: true }), 500);
      }
    } catch (error) {
      setLoad(false);
      if (error instanceof AxiosError) {
        setError(
          error.response?.data.details?.[0]?.message || "Erro ao fazer login",
        );
        return;
      }
      setError("Erro inesperado ao fazer login");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/public/ex-root`);
        setS(data.s);
      } catch (error) {
        return;
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg flex flex-col gap-6">
        <div className="text-center mb-2">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">
            Painel Root
          </h1>
          <p className="text-gray-500">Acesse sua conta administrativa</p>
        </div>
        <form
          className="flex flex-col gap-y-5"
          onSubmit={(s) => {
            s.preventDefault();
            login(fields);
          }}
          autoComplete="off"
        >
          <div className="flex flex-col gap-y-4">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Email</span>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="email"
                  onChange={({ target }) =>
                    setFields({ ...fields, email: target.value })
                  }
                  className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-900 transition"
                  type="email"
                  placeholder="Digite o email de acesso"
                  value={fields.email}
                  autoFocus
                  required
                />
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Senha</span>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  onChange={({ target }) =>
                    setFields({ ...fields, password: target.value })
                  }
                  className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-gray-900 transition"
                  type="password"
                  value={fields.password}
                  placeholder="Digite a senha de acesso"
                  required
                />
              </div>
            </label>
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center mt-1">{error}</div>
          )}
          <div className="flex flex-col gap-3">
            <button
              className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={load}
            >
              {load && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              {load ? "Entrando..." : "Entrar"}
            </button>
            {!s && (
              <button
                className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                disabled={load}
                onClick={() => {
                  register(fields);
                }}
              >
                {load && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                )}
                {load ? "Criando..." : "Criar conta"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
