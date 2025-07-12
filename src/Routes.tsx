import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthorizationProvider } from "./contexts/authorization.context";
import { AppLayout } from "./layout";
import { ShootingSpeedsPage } from "./pages/ShootingSpeeds";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { AccountsPage } from "./pages/Accounts";
import { FlowsPage } from "./pages/Flows";

export const RoutesApp: FC = (): JSX.Element => (
  <BrowserRouter>
    <Routes>
      <Route path={"/login"} element={<LoginPage />} />
      <Route
        path=""
        element={
          <AuthorizationProvider>
            <AppLayout />
          </AuthorizationProvider>
        }
      >
        <Route path={"/"} element={<HomePage />} />
        <Route path={"/shooting-speeds"} element={<ShootingSpeedsPage />} />
        <Route path={"/accounts"} element={<AccountsPage />} />
        <Route path={"/flows"} element={<FlowsPage />} />
      </Route>

      <Route path={"*"} element={<div>Página não encontrada</div>} />
    </Routes>
  </BrowserRouter>
);
