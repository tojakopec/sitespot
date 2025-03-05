import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col mt-0 pt-0">
      <header className="w-full flex-shrink-0">
        <Navigation />
      </header>
      <main className="flex-grow w-4/5 mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
