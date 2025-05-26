import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import Menu from './Menu'

const App = () => {
  return (
    <div>
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/menu">Menu</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </div>
  )
}

export default App