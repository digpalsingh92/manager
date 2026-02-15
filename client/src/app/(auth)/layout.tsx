export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-neutral-950 p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
              <span className="text-xl font-bold text-neutral-900">PM</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              ProManage
            </span>
          </div>
          <p className="text-lg text-neutral-400 leading-relaxed">
            The modern project management platform for teams that ship fast.
            Kanban boards, task tracking, and team collaboration — all in one
            place.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              { value: "Kanban", label: "Drag & Drop Boards" },
              { value: "RBAC", label: "Role-Based Access" },
              { value: "Real-time", label: "Live Updates" },
              { value: "Teams", label: "Collaboration" },
            ].map((item) => (
              <div
                key={item.value}
                className="rounded-lg border border-neutral-800 p-4"
              >
                <p className="font-semibold text-white text-sm">{item.value}</p>
                <p className="text-xs text-neutral-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
