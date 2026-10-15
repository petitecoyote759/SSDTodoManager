import "./App.css";
import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/items'

interface Item {
  id: number
  name: string
  description: string
}


export default function App() {
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

  return (

    <div className="app">
      <aside className="sidebar">
        {/*Books Bar*/}
        <div className="bookBar">
          <div className="bookBar-title">
            <h1 className="books-title">Books</h1>
          </div>
          {/*Books go here*/}
        </div>
      </aside>


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
