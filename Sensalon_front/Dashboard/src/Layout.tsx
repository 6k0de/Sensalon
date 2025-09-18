// Layout.tsx
import React from "react";
import { Topbar } from "./components/Topbar/topbar";
import { Sidebar } from "./components/Sidebar/sidebar";

type Props = React.PropsWithChildren<{}>;

export const Layout = ({ children }: Props) => {
  return (
    <div>
      <Topbar />
      <Sidebar />
      <div className="p-12 bg-[#f7f7f6] min-h-screen sm:ml-64 flex flex-col">
        {/* Asegúrate de que el contenido principal sea flexible */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};
