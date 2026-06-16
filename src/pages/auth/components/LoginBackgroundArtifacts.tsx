function DotGrid({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
        backgroundSize: '14px 14px',
      }}
    />
  )
}

function GhostCalendarGrid() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dates = Array.from({ length: 35 }, (_, i) => i + 1)
  const eventDots: Record<number, 'purple' | 'yellow'> = {
    3: 'purple',
    8: 'yellow',
    12: 'purple',
    18: 'yellow',
    22: 'purple',
    27: 'yellow',
  }

  return (
    <div
      className="pointer-events-none absolute top-10 right-[2%] hidden w-[22rem] xl:block 2xl:w-[26rem]"
      aria-hidden
    >
      <div className="mb-4 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <span
            key={day}
            className="text-center text-[10px] font-medium tracking-wide text-zinc-400/80 2xl:text-[11px]"
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-2 gap-y-2.5">
        {dates.map((date) => {
          const isToday = date === 15
          const dot = eventDots[date]

          return (
            <div
              key={date}
              className="flex flex-col items-center justify-center"
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-[11px] 2xl:size-8 2xl:text-xs ${
                  isToday
                    ? 'bg-[#7340DC]/15 font-semibold text-[#7340DC]/50'
                    : 'text-zinc-400/70'
                }`}
              >
                {date <= 31 ? date : ''}
              </span>
              {dot && (
                <span
                  className={`mt-1 size-1.5 rounded-full 2xl:size-[7px] ${
                    dot === 'purple' ? 'bg-[#7340DC]/35' : 'bg-amber-400/35'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GhostScheduleCard() {
  return (
    <div
      className="pointer-events-none absolute right-[calc(4%+700px)] bottom-[8%] hidden w-44 rounded-2xl border border-zinc-300/40 bg-white/40 p-3.5 shadow-sm backdrop-blur-[1px] xl:block 2xl:bottom-[10%]"
      aria-hidden
    >
      <p className="mb-2.5 text-[10px] font-semibold text-zinc-400/80">Today</p>
      <div className="space-y-2">
        <div className="rounded-lg bg-[#7340DC]/[0.06] px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 shrink-0 rounded-full bg-[#7340DC]/30" />
            <span className="text-[10px] font-medium text-zinc-500/70">Team Standup</span>
          </div>
          <p className="mt-0.5 pl-3 text-[9px] text-zinc-400/60">9:00 – 9:30 AM</p>
        </div>
        <div className="rounded-lg bg-amber-400/[0.06] px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 shrink-0 rounded-full bg-amber-400/30" />
            <span className="text-[10px] font-medium text-zinc-500/70">Design Review</span>
          </div>
          <p className="mt-0.5 pl-3 text-[9px] text-zinc-400/60">2:00 – 3:00 PM</p>
        </div>
      </div>
    </div>
  )
}

export function LoginBackgroundArtifacts() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.45]">
      <DotGrid className="absolute top-8 left-8 h-28 w-28" />
      <DotGrid className="absolute right-10 bottom-10 h-20 w-32" />

      <GhostCalendarGrid />
      <GhostScheduleCard />
    </div>
  )
}
