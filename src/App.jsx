import { useState, useEffect, useCallback } from 'react'
import './App.css'

/* ============ 世界观配置 ============ */
const WORLDS = {
  fantasy: {
    name: '中世纪奇幻',
    icon: '🏰',
    bg: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #11001c 100%)',
    cardBg: 'rgba(45,27,105,0.85)',
    accent: '#ffd700',
    monsters: ['巨龙', '暗影兽', '亡灵骑士', '深渊恶魔', '森林树人'],
    places: ['幽暗森林', '龙息火山', '遗忘废墟', '冰霜山脉', '魔法学院'],
    verbs: ['斩杀', '封印', '净化', '征服', '守护'],
  },
  cyberpunk: {
    name: '赛博朋克',
    icon: '🌃',
    bg: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0d0d2b 100%)',
    cardBg: 'rgba(10,14,39,0.85)',
    accent: '#00ffff',
    monsters: ['AI核心', '黑客幽灵', '机械暴龙', '数据吞噬者', '病毒君主'],
    places: ['霓虹市区', '地下数据港', '天空城', '废弃工厂', '量子实验室'],
    verbs: ['破解', '摧毁', '入侵', '净化', '夺取'],
  },
  modern: {
    name: '现代冒险',
    icon: '🏙️',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    cardBg: 'rgba(22,33,62,0.85)',
    accent: '#e94560',
    monsters: ['拖延兽', '焦虑影魔', 'deadline怪物', '压力巨人'],
    places: ['城市咖啡馆', '深夜办公室', '图书馆', '健身房', '家中书房'],
    verbs: ['击败', '征服', '完成', '解锁', '通关'],
  },
}

/* ============ 模拟 AI 生成（无 API 时降级） ============ */
function mockGenerate(todo, world, minutes, difficulty) {
  const w = WORLDS[world]
  const monster = w.monsters[Math.floor(Math.random() * w.monsters.length)]
  const place = w.places[Math.floor(Math.random() * w.places.length)]
  const verb = w.verbs[Math.floor(Math.random() * w.verbs.length)]
  const short = todo.length > 8 ? todo.slice(0, 8) + '…' : todo
  const points = Math.round(minutes * (difficulty || 1.0))
  return { desc: `${verb}【${short}】— 在【${place}】击败【${monster}】，奖励${points}积分`, points }
}

/* ============ 积分计算 ============ */
function calcPoints(minutes, difficulty) {
  return Math.round(minutes * (difficulty || 1.0))
}

/* ============ 商店数据 ============ */
const SHOP_ITEMS = [
  { id: 'skin-fantasy-dragon', name: '龙巢主题', world: 'fantasy', cost: 500, type: 'theme' },
  { id: 'skin-fantasy-magic', name: '魔法学院主题', world: 'fantasy', cost: 2000, type: 'theme' },
  { id: 'skin-fantasy-holy', name: '圣域主题', world: 'fantasy', cost: 5000, type: 'theme' },
  { id: 'skin-cyber-neon', name: '霓虹城主题', world: 'cyberpunk', cost: 500, type: 'theme' },
  { id: 'skin-cyber-matrix', name: '矩阵主题', world: 'cyberpunk', cost: 2000, type: 'theme' },
  { id: 'skin-cyber-ai', name: 'AI核心主题', world: 'cyberpunk', cost: 5000, type: 'theme' },
  { id: 'skin-mod-urban', name: '都市夜色主题', world: 'modern', cost: 500, type: 'theme' },
  { id: 'skin-mod-cafe', name: '咖啡馆主题', world: 'modern', cost: 2000, type: 'theme' },
  { id: 'skin-mod-sunset', name: '日落大道主题', world: 'modern', cost: 5000, type: 'theme' },
  { id: 'char-knight', name: '骑士皮肤', world: 'fantasy', cost: 300, type: 'char' },
  { id: 'char-mage', name: '法师皮肤', world: 'fantasy', cost: 800, type: 'char' },
  { id: 'char-hacker', name: '黑客皮肤', world: 'cyberpunk', cost: 500, type: 'char' },
  { id: 'char-robot', name: '机器人皮肤', world: 'cyberpunk', cost: 1500, type: 'char' },
  { id: 'char-office', name: '上班族皮肤', world: 'modern', cost: 300, type: 'char' },
  { id: 'char-athlete', name: '运动员皮肤', world: 'modern', cost: 1000, type: 'char' },
  { id: 'prop-double', name: '双倍积分卡（1小时）', world: 'all', cost: 1000, type: 'prop' },
  { id: 'prop-freeze', name: '连击冻结卡', world: 'all', cost: 800, type: 'prop' },
]

/* ============ 个人设置表单组件 ============ */
function ProfileSetupForm({ initialName, initialBirthday, onSave, isFirstTime }) {
  const [name, setName] = useState(initialName)
  const [bday, setBday] = useState(initialBirthday)

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave(name.trim(), bday)
  }

  const bdayInfo = bday ? (() => {
    const today = new Date()
    const b = new Date(bday + 'T00:00:00')
    const age = today.getFullYear() - b.getFullYear() -
      (today < new Date(today.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0)
    let next = new Date(today.getFullYear(), b.getMonth(), b.getDate())
    if (next < today) next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate())
    const days = Math.ceil((next - today) / 86400000)
    return { age, days }
  })() : null

  return (
    <div className="profile-setup">
      <p className="setup-hint">{isFirstTime ? '请创建你的冒险者角色' : '修改个人信息'}</p>
      <div className="form-group">
        <label>冒险者名字 *</label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="输入你的名字"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <div className="form-group">
        <label>生日（选填）</label>
        <input
          type="date" value={bday} onChange={e => setBday(e.target.value)}
        />
      </div>
      {bdayInfo && (
        <p className="birthday-info">
          🎂 {bdayInfo.age}岁 | 距离下次生日还有 <strong>{bdayInfo.days}</strong> 天
        </p>
      )}
      <div className="modal-btns">
        <button onClick={handleSubmit} className="btn-add" disabled={!name.trim()}>
          {isFirstTime ? '开始冒险 ⚔️' : '保存'}
        </button>
        {!isFirstTime && (
          <button onClick={() => onSave(initialName, initialBirthday)}>取消</button>
        )}
      </div>
    </div>
  )
}

/* ============ 主组件 ============ */
export default function App() {
  /* -- 状态 -- */
  const [world, setWorld] = useState(() => localStorage.getItem('rpg-world') || '')
  const [username, setUsername] = useState(() => localStorage.getItem('rpg-username') || '')
  const [birthday, setBirthday] = useState(() => localStorage.getItem('rpg-birthday') || '')
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('rpg-todos') || '[]'))
  const [points, setPoints] = useState(() => Number(localStorage.getItem('rpg-points') || 0))
  const [level, setLevel] = useState(() => Number(localStorage.getItem('rpg-level') || 1))
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('rpg-streak') || 0))
  const [lastDate, setLastDate] = useState(() => localStorage.getItem('rpg-lastDate') || '')
  const [skins, setSkins] = useState(() => JSON.parse(localStorage.getItem('rpg-skins') || '[]'))
  const [activeSkin, setActiveSkin] = useState(() => localStorage.getItem('rpg-activeSkin') || '')
  const [input, setInput] = useState('')
  const [minutes, setMinutes] = useState(30)
  const [difficulty, setDifficulty] = useState(1.0)
  const [shopOpen, setShopOpen] = useState(false)
  const [shopTab, setShopTab] = useState('theme')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [toast, setToast] = useState('')

  /* -- 首次访问检测 -- */
  useEffect(() => {
    if (!username) setShowProfileSetup(true)
  }, [username])

  /* -- 持久化 -- */
  useEffect(() => { localStorage.setItem('rpg-world', world) }, [world])
  useEffect(() => { localStorage.setItem('rpg-username', username) }, [username])
  useEffect(() => { localStorage.setItem('rpg-birthday', birthday) }, [birthday])
  useEffect(() => { localStorage.setItem('rpg-todos', JSON.stringify(todos)) }, [todos])
  useEffect(() => { localStorage.setItem('rpg-points', points) }, [points])
  useEffect(() => { localStorage.setItem('rpg-level', level) }, [level])
  useEffect(() => { localStorage.setItem('rpg-streak', streak) }, [streak])
  useEffect(() => { localStorage.setItem('rpg-lastDate', lastDate) }, [lastDate])
  useEffect(() => { localStorage.setItem('rpg-skins', JSON.stringify(skins)) }, [skins])
  useEffect(() => { localStorage.setItem('rpg-activeSkin', activeSkin) }, [activeSkin])

  /* -- 等级 -- */
  useEffect(() => {
    const newLevel = Math.floor(points / 1000) + 1
    if (newLevel !== level) setLevel(newLevel)
  }, [points])

  /* -- 连击检测 -- */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (lastDate && lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      if (lastDate !== yesterday) setStreak(0)
    }
  }, [lastDate])

  /* -- Toast -- */
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  /* -- 保存个人设置 -- */
  const saveProfile = useCallback((name, bday) => {
    if (name && name.trim()) setUsername(name.trim())
    setBirthday(bday || '')
    setShowProfileSetup(false)
    setShowSettings(false)
    showToast('✅ 保存成功！')
  }, [showToast])

  /* -- 生成任务 -- */
  const generateTask = useCallback((text) => {
    if (!world) { showToast('⚠️ 请先选择世界观！'); return null }
    const result = mockGenerate(text, world, minutes, difficulty)
    return {
      id: Date.now() + Math.random(),
      text,
      desc: result.desc,
      points: result.points,
      difficulty,
      minutes,
      done: false,
      created: new Date().toISOString(),
    }
  }, [world, minutes, difficulty, showToast])

  /* -- 添加待办 -- */
  const addTodo = useCallback(() => {
    if (!input.trim()) return
    const task = generateTask(input.trim())
    if (!task) return
    setTodos(prev => [task, ...prev])
    setInput('')
    showToast('✅ 任务已生成！')
  }, [input, generateTask, showToast])

  /* -- 文件导入 -- */
  const handleFileImport = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      const newTasks = lines.map(line => generateTask(line)).filter(Boolean)
      setTodos(prev => [...newTasks, ...prev])
      showToast(`✅ 导入了 ${newTasks.length} 个任务`)
    }
    reader.readAsText(file)
  }, [generateTask, showToast])

  /* -- 批量文本导入 -- */
  const handleBulkImport = useCallback(() => {
    const lines = importText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    const newTasks = lines.map(line => generateTask(line)).filter(Boolean)
    setTodos(prev => [...newTasks, ...prev])
    setImportText('')
    setShowImport(false)
    showToast(`✅ 导入了 ${newTasks.length} 个任务`)
  }, [importText, generateTask, showToast])

  /* -- 完成任务 -- */
  const completeTask = useCallback((id) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== id || t.done) return t
      const today = new Date().toISOString().slice(0, 10)
      let newStreak = streak
      if (lastDate === today) {
        newStreak = streak + 1
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        newStreak = lastDate === yesterday ? streak + 1 : 1
      }
      const streakBonus = newStreak >= 3 ? 1.2 : 1.0
      const finalPoints = Math.round(t.points * streakBonus)
      setPoints(p => p + finalPoints)
      setStreak(newStreak)
      setLastDate(today)
      showToast(`🎉 +${finalPoints} 积分！连击 x${newStreak}`)
      return { ...t, done: true, completedAt: new Date().toISOString() }
    }))
  }, [streak, lastDate, showToast])

  /* -- 删除任务 -- */
  const deleteTask = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  /* -- 购买商品 -- */
  const buyItem = useCallback((item) => {
    if (points < item.cost) { showToast('⚠️ 积分不足！'); return }
    if (skins.includes(item.id)) { showToast('⚠️ 已拥有！'); return }
    setPoints(p => p - item.cost)
    setSkins(prev => [...prev, item.id])
    showToast(`🎉 获得【${item.name}】！`)
  }, [points, skins, showToast])

  /* -- 当前世界观样式 -- */
  const wStyle = WORLDS[world] || WORLDS.fantasy

  /* -- 任务分类 -- */
  const activeTodos = todos.filter(t => !t.done)
  const doneTodos = todos.filter(t => t.done)

  /* -- 每日登录 -- */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const lastLogin = localStorage.getItem('rpg-lastLogin')
    if (lastLogin !== today) {
      setPoints(p => p + 50)
      localStorage.setItem('rpg-lastLogin', today)
      showToast('🎁 每日登录 +50 积分！')
    }
  }, [showToast])

  /* -- 未选世界观 -- */
  if (!world) {
    return (
      <div className="app" style={{ background: '#1a1a2e', minHeight: '100vh' }}>
        {/* 个人设置弹窗（首次） */}
        {showProfileSetup && (
          <div className="modal-overlay" onClick={e => e.stopPropagation()}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>🎮 欢迎来到 RPG 待办冒险！</h3>
              <ProfileSetupForm
                initialName={username} initialBirthday={birthday}
                onSave={saveProfile} isFirstTime
              />
            </div>
          </div>
        )}
        <div className="world-select">
          <h1>⚔️ RPG 待办冒险</h1>
          <p className="subtitle">选择你的冒险世界观</p>
          <div className="world-cards">
            {Object.entries(WORLDS).map(([key, w]) => (
              <div key={key} className="world-card" onClick={() => setWorld(key)}
                style={{ borderColor: w.accent }}>
                <span className="world-icon">{w.icon}</span>
                <h2>{w.name}</h2>
                <p>怪物：{w.monsters.slice(0, 3).join(' / ')}</p>
                <p>场景：{w.places.slice(0, 3).join(' / ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* -- 主界面 -- */
  return (
    <div className="app" style={{ background: wStyle.bg }}>
      {toast && <div className="toast">{toast}</div>}

      {/* 个人设置弹窗 */}
      {(showProfileSetup || showSettings) && (
        <div className="modal-overlay" onClick={e => e.stopPropagation()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{showProfileSetup ? '🎮 欢迎来到 RPG 待办冒险！' : '⚙️ 个人设置'}</h3>
            <ProfileSetupForm
              initialName={username} initialBirthday={birthday}
              onSave={saveProfile} isFirstTime={showProfileSetup}
            />
          </div>
        </div>
      )}

      {/* 顶部栏 */}
      <header className="header">
        <div className="header-left">
          <span className="world-icon-sm">{wStyle.icon}</span>
          <span className="world-name">{wStyle.name}</span>
        </div>
        <div className="header-center">
          <span className="level-badge">Lv.{level}</span>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${points % 1000 / 10}%` }} />
          </div>
          <span className="points">{points} XP</span>
        </div>
        <div className="header-right">
          <span className="username-display">🧑 {username || '冒险者'}</span>
          <button className="btn-settings" onClick={() => setShowSettings(true)}>⚙️</button>
          <span className="streak-badge">🔥 连击 x{streak}</span>
          <button className="btn-shop" onClick={() => setShopOpen(true)}>🛒 商店</button>
          <button className="btn-switch" onClick={() => setWorld('')}>🔄 换世界观</button>
        </div>
      </header>

      {/* 添加待办 */}
      <section className="add-section">
        <div className="add-row">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder="输入待办事项，按回车生成RPG任务…"
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          <button onClick={addTodo} className="btn-add">生成任务 ⚔️</button>
          <button onClick={() => setShowImport(true)} className="btn-import">📥 导入</button>
        </div>
        <div className="add-options">
          <label>预估耗时：
            <input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min="1" />
            <span>分钟</span>
          </label>
          <label>难度系数：
            <select value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>
              <option value="0.5">简单 (×0.5)</option>
              <option value="1.0">普通 (×1.0)</option>
              <option value="1.5">困难 (×1.5)</option>
              <option value="2.0">极难 (×2.0)</option>
            </select>
          </label>
        </div>
      </section>

      {/* 导入弹窗 */}
      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>📥 批量导入待办</h3>
            <p>每行一个待办事项</p>
            <textarea
              value={importText} onChange={e => setImportText(e.target.value)}
              placeholder="买菜\n写完报告\n锻炼30分钟"
              rows={8}
            />
            <div className="modal-btns">
              <button onClick={handleBulkImport} className="btn-add">确认导入</button>
              <button onClick={() => setShowImport(false)}>取消</button>
            </div>
            <div className="file-import">
              <label>或上传 TXT/CSV 文件：
                <input type="file" accept=".txt,.csv" onChange={handleFileImport} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 商店弹窗 */}
      {shopOpen && (
        <div className="modal-overlay" onClick={() => setShopOpen(false)}>
          <div className="modal shop-modal" onClick={e => e.stopPropagation()}>
            <h3>🛒 兑换商店</h3>
            <p className="shop-points">当前积分：<strong>{points}</strong> XP</p>
            <div className="shop-tabs">
              {['theme', 'char', 'prop'].map(tab => (
                <button key={tab} className={shopTab === tab ? 'active' : ''}
                  onClick={() => setShopTab(tab)}>
                  {tab === 'theme' ? '🎨 主题' : tab === 'char' ? '👤 角色' : '⚡ 道具'}
                </button>
              ))}
            </div>
            <div className="shop-items">
              {SHOP_ITEMS.filter(item => {
                if (shopTab === 'theme') return item.type === 'theme'
                if (shopTab === 'char') return item.type === 'char'
                return item.type === 'prop'
              }).map(item => (
                <div key={item.id} className={`shop-item ${skins.includes(item.id) ? 'owned' : ''}`}
                  onClick={() => buyItem(item)}
                  style={{ borderColor: WORLDS[item.world]?.accent || wStyle.accent }}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-cost">{item.cost} XP</span>
                  {skins.includes(item.id) && <span className="item-owned">✅ 已拥有</span>}
                </div>
              ))}
            </div>
            <button className="btn-close" onClick={() => setShopOpen(false)}>关闭</button>
          </div>
        </div>
      )}

      {/* 任务列表 */}
      <main className="task-list">
        {activeTodos.length === 0 && (
          <div className="empty-state">
            <p>🎮 暂无进行中的任务</p>
            <p>输入待办事项，生成你的RPG冒险任务吧！</p>
          </div>
        )}
        {activeTodos.map(task => (
          <div key={task.id} className="task-card" style={{ background: wStyle.cardBg, borderColor: wStyle.accent }}>
            <div className="task-info">
              <p className="task-desc">{task.desc}</p>
              <p className="task-meta">原始：「{task.text}」| {task.minutes}分钟 | 难度×{task.difficulty} | 奖励 {task.points} XP</p>
            </div>
            <div className="task-actions">
              <button className="btn-complete" onClick={() => completeTask(task.id)}>✅ 完成</button>
              <button className="btn-delete" onClick={() => deleteTask(task.id)}>🗑️</button>
            </div>
          </div>
        ))}

        {doneTodos.length > 0 && (
          <>
            <h2 className="section-title">🎉 已完成</h2>
            {doneTodos.map(task => (
              <div key={task.id} className="task-card done" style={{ background: wStyle.cardBg }}>
                <div className="task-info">
                  <p className="task-desc" style={{ opacity: 0.6 }}>{task.desc}</p>
                  <p className="task-meta" style={{ opacity: 0.4 }}>已完成 +{task.points} XP</p>
                </div>
                <button className="btn-delete" onClick={() => deleteTask(task.id)}>🗑️</button>
              </div>
            ))}
          </>
        )}
      </main>

      {/* 底部进度 */}
      <footer className="footer">
        <p>等级 Lv.{level} | 积分 {points} XP | 连击 x{streak} | 已完成 {doneTodos.length} 个任务</p>
        <p className="footer-note">积分永不重置 | 每日登录 +50 XP | 🧑 {username}</p>
      </footer>
    </div>
  )
}
