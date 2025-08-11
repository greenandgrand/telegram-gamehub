import React, { useEffect, useMemo, useState } from 'react'

declare global {
  interface Window { Telegram: any }
}

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined

function useTelegram() {
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  useEffect(() => {
    if (!tg) return
    tg.ready()
    tg.expand()
    try {
      setTheme(tg.colorScheme === 'dark' ? 'dark' : 'light')
      tg.MainButton.setText('Close')
      tg.MainButton.onClick(() => tg.close())
      tg.MainButton.show()
    } catch {}
  }, [])
  return { tg, theme }
}

function Tapper() {
  const key = 'game_tapper_highscore'
  const [score, setScore] = useState(0)
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem(key) || 0))

  useEffect(() => {
    if (score > best) {
      setBest(score)
      localStorage.setItem(key, String(score))
    }
  }, [score])

  return (
    <div className="gamebox">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <div className="muted">Tap as fast as you can</div>
        <div className="muted">Best: <span className="score">{best}</span></div>
      </div>
      <button className="btn primary" style={{width:'100%',height:64,fontSize:22}}
        onClick={() => setScore(v => v + 1)}>
        TAP — {score}
      </button>
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button className="btn secondary" onClick={() => setScore(0)}>Reset</button>
      </div>
    </div>
  )
}

function MemoryMatch() {
  const icons = ['🍎','🍋','🍒','🍎','🍋','🍒']
  const shuffled = useMemo(() => [...icons].sort(() => Math.random()-0.5), [])
  const [open, setOpen] = useState<number[]>([])
  const [cleared, setCleared] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    if (open.length === 2) {
      setMoves(m => m+1)
      const [a,b] = open
      if (shuffled[a] === shuffled[b]) setCleared(prev => [...prev, a, b])
      const t = setTimeout(() => setOpen([]), 600)
      return () => clearTimeout(t)
    }
  }, [open])

  const allDone = cleared.length === shuffled.length

  return (
    <div className="gamebox">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <div className="muted">Find the pairs</div>
        <div className="muted">Moves: <span className="score">{moves}</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {shuffled.map((v, i) => {
          const isOpen = open.includes(i)
          const isClear = cleared.includes(i)
          return (
            <button key={i}
              className="btn secondary"
              disabled={isClear || (open.length===2 && !isOpen)}
              onClick={() => !isOpen && setOpen(o => [...o, i])}
              style={{height:64,fontSize:24,opacity:isClear?0.4:1}}>
              {(isOpen || isClear) ? v : '❓'}
            </button>
          )
        })}
      </div>
      {allDone && <div style={{marginTop:8}} className="muted">🎉 Completed!</div>}
    </div>
  )
}

export default function App() {
  const { theme } = useTelegram()

  const games = [
    { id: 'tapper', name: 'Tapper', component: <Tapper/> },
    { id: 'memory', name: 'Memory Match', component: <MemoryMatch/> },
  ] as const

  const [active, setActive] = useState<(typeof games)[number]['id']>('tapper')

  return (
    <div className="wrap" data-theme={theme}>
      <div className="header">
        <div>
          <div className="title">🎮 GameHub</div>
          <div className="muted">Mini App running inside Telegram</div>
        </div>
        <button className="btn secondary" onClick={() => location.reload()}>Reload</button>
      </div>

      <div className="grid" style={{marginTop:16}}>
        <div className="card">
          <div style={{fontWeight:700, marginBottom:8}}>Games</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {games.map(g => (
              <button key={g.id}
                className={`btn ${active===g.id? 'primary':'secondary'}`}
                onClick={() => setActive(g.id)}>
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{gridColumn:'1 / -1'}}>
          {games.find(g => g.id === active)?.component}
        </div>
      </div>

      <div className="footer">Made for Telegram Mini Apps • Add your own HTML5 games and routes here.</div>
    </div>
  )
}
