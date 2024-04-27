import SideNav from "./SideNav";

export default function Sidebar() {
  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
      <aside className="hidden flex-col md:flex w-[300px]">
        <SideNav />
      </aside>
    </div>
  );
}
