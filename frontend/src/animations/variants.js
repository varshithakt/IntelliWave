export const panelIn = {
  hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export const metricPop = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 210, damping: 22 } },
}
