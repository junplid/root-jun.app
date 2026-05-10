import { FC, JSX } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthorizationProvider } from "./contexts/authorization.context";
import { AppLayout } from "./layout";
import { ShootingSpeedsPage } from "./pages/ShootingSpeeds";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { AccountsPage } from "./pages/Accounts";
import { FlowsPage } from "./pages/Flows";
import { GeralLogsPage } from "./pages/GeralLogs";
import { SocketProvider } from "./contexts/socket.context";
import { AgentTemplatesPage } from "./pages/Templates";
import { CreateAgentTemplatePage } from "./pages/Templates/page-create";
import { UpdateAgentTemplatePage } from "./pages/Templates/page-edit";

export const RoutesApp: FC = (): JSX.Element => (
  <BrowserRouter>
    <Routes>
      <Route path={"/login"} element={<LoginPage />} />
      <Route
        path=""
        element={
          <AuthorizationProvider>
            <SocketProvider>
              <AppLayout />
            </SocketProvider>
          </AuthorizationProvider>
        }
      >
        <Route path={"/"} element={<HomePage />} />
        <Route path={"/shooting-speeds"} element={<ShootingSpeedsPage />} />
        <Route path={"/accounts"} element={<AccountsPage />} />
        <Route path={"/flows"} element={<FlowsPage />} />
        <Route path={"/geral-logs"} element={<GeralLogsPage />} />
        <Route path={"/templates"} element={<AgentTemplatesPage />} />
        <Route
          path={"/templates/create"}
          element={<CreateAgentTemplatePage />}
        />
        <Route
          path={"/templates/:id"}
          element={<UpdateAgentTemplatePage />}
        />
      </Route>

      <Route path={"*"} element={<div>Página não encontrada</div>} />
    </Routes>
  </BrowserRouter>
);
