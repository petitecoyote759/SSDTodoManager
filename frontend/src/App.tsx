import "./App.css";
import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/items'

interface Item {
  id: number
  name: string
  description: string
}


export default function App() {

  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [isDragging, setIsDragging] = useState(false)

  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState<string>('')

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    const res = await fetch(API)
    const j = await res.json()
    setItems(j)
  }

  async function addItem(e: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) {
    e.preventDefault()
    if (!name.trim()) return
    await fetch(API, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name})})
    setName('')
    await loadItems()
  }

  async function deleteItem(id: number) {
    await fetch(`${API}/${id}`, {method: 'DELETE'})
    await loadItems()
  }




  function startResize(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)

    const startX = e.clientX
    const startWidth = sidebarWidth

    // Updated mouse move functions
    function onMouseMove(mouseEvent: MouseEvent) {
      const newWidth = startWidth + mouseEvent.clientX - startX
      setSidebarWidth(Math.min(500, Math.max(150, newWidth))) // TODO: fix these hardcoded constants
    }

    function onMouseUp()
    {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    // add those listeners
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }












  return (

    <div className="app">
      <aside className="sidebar" style={{width : sidebarWidth}}>
        {/*Books Bar*/}
        <div className="bookBar">
          <div className="bookBar-title">
            <h1 className="books-title">Books</h1>
          </div>
          {/*Books go here*/}
        </div>
      </aside>

      <div 
        className={`resize-handle ${isDragging ? 'dragging': ''}`}
        onMouseDown={startResize}
      />



      {/*User Profile*/}
      <div className="user-profile">
        Here is the user
        {/*Add onclick stuff to show info*/}
      </div>


      <main className="list-area">
        <form onSubmit={addItem}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="New item name" />
          <button type="submit">Add</button>
        </form>
        <ul>
          {items.map(it => (
            <li key={it.id}>
              <strong>{it.name}</strong> {it.description || ''}
              <button onClick={() => deleteItem(it.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
