import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <span className="text-xs font-bold text-neutral-900">PM</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ProManage
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Manage projects
            <br />
            with confidence.
          </h1>
          <p className="text-neutral-400 text-base max-w-sm leading-relaxed">
            Track tasks, collaborate with your team, and deliver projects on
            time — all in one clean workspace.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Task Tracking",
                desc: "Kanban boards & task management",
              },
              {
                title: "Team Collaboration",
                desc: "Real-time project updates",
              },
              {
                title: "Role-Based Access",
                desc: "Granular permissions system",
              },
              { title: "Analytics", desc: "Project insights & reports" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-4"
              >
                <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
                <p className="text-xs text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500">Trusted by teams worldwide</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
