import { Outlet } from "react-router-dom";
export default function SignUp() {
  return (
    <>
      <div
        className="w-1/2 rounded-l-lg min-h-max bg-[url(../assets/photos/signup-left-crane.jpg)]
      bg-cover bg-center bg-no-repeat 
      [mask-image:linear-gradient(to_right,black_30%,transparent)]"
      >
        <h1 className="text-4xl font-bold text-center pt-10 text-white">
          SiteSpot
        </h1>
      </div>
      <div className="w-1/2 rounded-r-lg min-h-max ">
        <Outlet />
      </div>
    </>
  );
}
