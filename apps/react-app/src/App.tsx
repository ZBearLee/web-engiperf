import { Routes, Route, NavLink } from 'react-router-dom'

function Home() {
  return (
    <div>
      <h1>React App</h1>
      <p>web-engiperf 的 React 子应用骨架</p>
    </div>
  )
}

export default function App() {
  return (
    <>
      <nav>
        <NavLink to="/">首页</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}
