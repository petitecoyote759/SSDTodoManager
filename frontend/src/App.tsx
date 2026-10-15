import "./App.css";
import {Note, Entry} from "./Classes.tsx"
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


  const [notes, setNotes] = useState<Note[]>([
    new Note(0, "Test Note", 100, 100, "#441144", undefined, 
      [new Entry("Testing!", 5), new Entry("Testing 2 but high prio", 10)]
    )])

  const [draggingNoteID, setDraggingNoteID] = useState<number | null>(null)
  const dragOffset = React.useRef({ x: 0, y: 0 })


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



  // << Resizing Sidebar >> //
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



  // << Dragging Notes >> //
  function startNoteDrag(e: React.PointerEvent<HTMLDivElement>, note: Note) {

    if (e.currentTarget.parentElement === null) { return; }
    const rect = e.currentTarget.parentElement.getBoundingClientRect()

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }


    e.currentTarget.setPointerCapture(e.pointerId)
    setDraggingNoteID(note.id)
  }

  function dragNote(e: React.PointerEvent<HTMLDivElement>, note: Note) {
    if (draggingNoteID != note.id) { return; }

    const noteElement = e.currentTarget.parentElement
    const area = noteElement?.parentElement
    if (noteElement == null || area == null) { return; }

    const bounds = area.getBoundingClientRect()
    const width = e.currentTarget.offsetWidth
    const height = e.currentTarget.offsetHeight


    const positionX = Math.max(0,
      Math.min(bounds.width - width, e.clientX - bounds.left - dragOffset.current.x))

    const positionY = Math.max(0,
      Math.min(bounds.height - height, e.clientY - bounds.top - dragOffset.current.y))


    setNotes(previous => previous.map(noteAlt => noteAlt.id === note.id ? {...noteAlt, positionX, positionY} : noteAlt))
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



        {notes.map(note => (
          <div key={note.id}
            className="note"
            style={{
              left: note.positionX,
              top: note.positionY,
              backgroundColor: note.tertiaryColour
            }}>
            <div className="note-header"
              style={{backgroundColor: note.primaryColour}}

              onPointerDown={e => startNoteDrag(e, note)}
              onPointerMove={e => dragNote(e, note)}
              onPointerUp={() => setDraggingNoteID(null)}
              onPointerCancel={() => setDraggingNoteID(null)}
            >
              <span className="note-header-text">{note.name}</span>
          </div>
          {note.entries.sort((a, b) => b.priority - a.priority).map(entry => (
            <div className="note-entry" style={{backgroundColor: note.secondaryColour}}>
              <span className="note-entry-priority">{`(${entry.priority})`}</span>
              {entry.text}
            </div>
          ))}
          </div>
        ))}
      </main>
    </div>
  )
}
