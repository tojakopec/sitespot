import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col mt-0 pt-0">
      <header className="w-4/5 mx-auto flex-shrink-0">
        <Navigation />
      </header>
      <main className="flex flex-col flex-grow w-4/5 h-0.5 min-h-max mx-auto my-8">
        <div className=" flex flex-row w-full bg-gradient-to-b from-gray-900/60 to-gray-700/70 mx-auto mb-16 min-h-full rounded-2xl shadow-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
