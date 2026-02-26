import { memo, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { FiLogOut, FiHome, FiUsers, FiTag } from "react-icons/fi";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ImInsertTemplate } from "react-icons/im";

export const AppLayout = memo(function AppLayout() {
  const [toggled, setToggled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="overflow-y-scroll flex flex-col relative w-full h-full gap-y-1">
      <header className="fixed z-10 bg-white top-0 flex items-center justify-between w-full px-5 py-2 border-b border-gray-100">
        <div className="flex items-center w-full gap-x-2">
          <div className="flex items-center w-full justify-between gap-x-10">
            <div className="flex items-center gap-x-3">
              <button
                className="hover:text-gray-600 min-[440px]:mr-4 mr-1 duration-200 text-gray-700"
                onClick={() => setToggled(true)}
                aria-label="Abrir menu"
              >
                <HiMenu size={30} />
              </button>
              <span className="text-sm font-bold min-[440px]:block hidden text-gray-700 tracking-tight select-none">
                <span className="font-extrabold">
                  Painel ROOT <span className="font-light">junplid.com.br</span>
                </span>{" "}
              </span>
            </div>
            <Link
              to={"/login"}
              className="flex cursor-pointer text-red-500 items-center gap-x-2 px-3 py-2 rounded-lg hover:bg-red-50 transition"
              title="Sair"
            >
              <FiLogOut size={20} />
              <span className="text-base font-semibold">Sair</span>
            </Link>
          </div>
        </div>
      </header>
      <div
        style={{ paddingTop: "56px" }}
        className="h-screen items-start w-full gap-x-1"
      >
        <Sidebar
          onBackdropClick={() => setToggled(false)}
          toggled={toggled}
          backgroundColor="#ffffff"
          breakPoint="always"
        >
          <Menu>
            <MenuItem
              onClick={() => setToggled(false)}
              component={<Link to={"/"} />}
              icon={<FiHome size={18} />}
              className={
                isActive("/") ? "bg-blue-50 text-blue-700 font-bold" : ""
              }
            >
              Home
            </MenuItem>
            <MenuItem
              onClick={() => setToggled(false)}
              component={<Link to={"/accounts"} />}
              icon={<FiUsers size={18} />}
              className={
                isActive("/accounts")
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : ""
              }
            >
              Contas
            </MenuItem>
            <MenuItem
              onClick={() => setToggled(false)}
              component={<Link to={"/flows"} />}
              icon={<FiUsers size={18} />}
              className={
                isActive("/flows") ? "bg-blue-50 text-blue-700 font-bold" : ""
              }
            >
              Fluxos
            </MenuItem>
            <MenuItem
              onClick={() => setToggled(false)}
              component={<Link to={"/geral-logs"} />}
              icon={<FiUsers size={18} />}
              className={
                isActive("/geral-logs")
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : ""
              }
            >
              Logs gerais
            </MenuItem>
            <MenuItem
              onClick={() => setToggled(false)}
              component={<Link to={"/shooting-speeds"} />}
              icon={<FiTag size={18} />}
              className={
                isActive("/shooting-speeds")
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : ""
              }
            >
              Velocidade de disparos
            </MenuItem>
            <MenuItem
              onClick={() => setToggled(false)}
              component={<Link to={"/agent-templates"} />}
              icon={<ImInsertTemplate size={18} />}
              className={
                isActive("/agent-templates")
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : ""
              }
            >
              Templates de agentes
            </MenuItem>
          </Menu>
        </Sidebar>
        <main
          style={{ height: "calc(100vh - 56px)" }}
          className="sm:px-5 px-3 w-full"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
});
