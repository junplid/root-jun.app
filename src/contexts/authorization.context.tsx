import { AxiosError } from "axios";
import {
  FC,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface AuthorizationContext_I {
  isAuth: boolean;
}

export const AuthorizationContext = createContext<AuthorizationContext_I>({
  isAuth: false,
} as AuthorizationContext_I);

interface PropsAuthorizationContextProvider_I {
  children: JSX.Element;
}

export const AuthorizationProvider: FC<PropsAuthorizationContextProvider_I> = ({
  children,
}): JSX.Element => {
  const [cookies] = useCookies(["auth_root"]);
  const navigate = useNavigate();

  // state local
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);

  const handleLogout = useCallback(() => {
    navigate("/login");
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const token = cookies.auth_root;
      if (!token) return handleLogout();
      await api.get(`/root/verify-authorization`);
      setIsLoaded(true);
      setIsAuth(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, []);

  const dataValue = useMemo(() => {
    return {
      isAuth,
    };
  }, [isAuth]);

  return (
    <AuthorizationContext.Provider value={dataValue}>
      {isLoaded ? (
        <>
          {isAuth ? (
            children
          ) : (
            <div className="p-2 flex flex-col">
              <strong>Você não está autorizado!</strong>
              <Link
                to={"/login"}
                className="text-blue-600 font-medium underline underline-offset-2"
              >
                Tente fazer o login, clicando aqui
              </Link>
            </div>
          )}
        </>
      ) : (
        <div>
          <strong>Verificando acesso...</strong>
        </div>
      )}
    </AuthorizationContext.Provider>
  );
};
