import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/items'

export default function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    const res = await fetch(API)
    const j = await res.json()
    setItems(j)
  }

  async function addItem(e) {
    e.preventDefault()
    if (!name.trim()) return
    await fetch(API, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name})})
    setName('')
    await loadItems()
  }

  async function deleteItem(id) {
    await fetch(`${API}/${id}`, {method: 'DELETE'})
    await loadItems()
  }

  return (
    <div className="container">
      <h1>Items</h1>
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
    </div>
  )
}
