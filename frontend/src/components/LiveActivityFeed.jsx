import { motion, AnimatePresence } from 'framer-motion'
import { TerminalSquare } from 'lucide-react'

export default function LiveActivityFeed({ events }) {
  return (
    <section className="pointer-events-auto rounded-2xl border border-cyan-300/20 bg-slate-950/72 p-4 shadow-neon backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2">
        <TerminalSquare className="h-5 w-5 text-cyan-200" />
        <h2 className="text-lg font-semibold text-white">Live AI Event Stream</h2>
      </div>
      <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {(events || []).slice().reverse().map((event, index) => (
            <motion.div
              key={`${event}-${index}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-slate-300"
            >
              <span className="mr-2 text-cyan-300">▸</span>
              {event}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
