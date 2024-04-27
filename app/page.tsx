import Image from "next/image";
import { ThemeToggle } from "./components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Sidebar from "./components/Sidebar";
import Posts from "./components/Posts";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();

  // if (await isAuthenticated()) {
  //   return redirect("/profile");
  // }

  return (
    <div className="flex justify-center items-center">
      <div className="w-1/4 fixed top-10 left-0 h-[100px] mt-20">
        {(await isAuthenticated()) ? <Sidebar /> : null}
      </div>
      <div className="w-1/2 text-center mt-3 ml-auto">
        <Posts />
      </div>
      <div className="w-1/4"></div>
    </div>
  );
}
