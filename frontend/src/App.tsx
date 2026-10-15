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


  const [editingNoteId, setEditingNoteID] = useState<number | null>(null)
  const [editedNoteName, setEditedNoteName] = useState("")


  const [notes, setNotes] = useState<Note[]>([
    new Note(0, "Test Note", 0, 0, "#441144", undefined, 
      [new Entry("Testing!", 2), new Entry("Testing 2 but high prio", 3)]
    ),

    new Note(1, "Other Note", 300, 0, "#111177", undefined, 
      [new Entry("Maybe some other stuff!", 1)]
    )
  ])

  const [draggingNoteID, setDraggingNoteID] = useState<number | null>(null)
  const dragOffset = React.useRef({ x: 0, y: 0 })


  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    const res = await fetch(API)
    const j = await res.json()
    setItems(j)
  }







  function saveNoteName(note: Note) {
    setNotes(previous => 
      previous.map(noteAlt => 
        noteAlt.id === note.id ?
          {...noteAlt, name: editedNoteName.trim() || noteAlt.name } : noteAlt
      )
    )
  }







  const [openEntryFormID, setOpenEntryFormID] = useState<number | null>(null)
  const [entryText, setEntryText] = useState('')
  const [entryPriority, setEntryPriority] = useState<number>(0)
  const [entryDueDate, setEntryDueDate] = useState('')

  async function addItem(note: Note, e: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) {
    e.preventDefault()

    if (!entryText.trim()) { return; }
    
    //await fetch(API, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name})})

    const dueDate = entryDueDate ? new Date(`${entryDueDate}T00:00:00`) : null

    const newEntry = new Entry(
      entryText.trim(),
      entryPriority,
      dueDate
    )

    setNotes(previous =>
      previous.map(noteAlt =>
        noteAlt.id === note.id ?
        { ...noteAlt, entries: [...noteAlt.entries, newEntry] } : noteAlt
      )
    )

    setEntryText('')
    setEntryPriority(0)
    setEntryDueDate('')
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


        

        {/*User Profile*/}
        <div className="user-profile">
          Here is the user
          {/*Add onclick stuff to show info*/}
        </div>
      </aside>

      <div 
        className={`resize-handle ${isDragging ? 'dragging': ''}`}
        onMouseDown={startResize}
      />


      <main className="list-area">
        



        {notes.map(note => (
          /*Notes*/
          <div key={note.id}
            className="note"
            style={{
              left: note.positionX,
              top: note.positionY,
              backgroundColor: note.tertiaryColour
            }}>

              {/*Note Header*/}
            <div className="note-header"
              style={{backgroundColor: note.primaryColour}}

              onPointerDown={e => startNoteDrag(e, note)}
              onPointerMove={e => dragNote(e, note)}
              onPointerUp={() => setDraggingNoteID(null)}
              onPointerCancel={() => setDraggingNoteID(null)}
            > {/*Either editing or just render the name*/}
              {editingNoteId === note.id ? (
                <>
                  <input
                    className="note-header-input"
                    value={editedNoteName}
                    onChange={e => setEditedNoteName(e.target.value)}
                    onPointerDown={e => e.stopPropagation()}
                    autoFocus
                  />

                  <button 
                    type="button"
                    className="note-header-input-save"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => {setEditingNoteID(null); saveNoteName(note)}}
                    >
                      Save
                    </button>
                </>
              ) : (
                <span className="note-header-text">{note.name}</span>
              )}
              <button 
                className="note-header-edit-button"
                onPointerDown={e => e.stopPropagation()}
                onClick={() => {
                  editingNoteId == note.id ? 
                    setEditingNoteID(null) :
                    setEditingNoteID(note.id)
                    setEditedNoteName(note.name)
                }} 
              >✎</button>
          </div>

          {/*Entries*/}
          {note.entries.sort((a, b) => b.priority - a.priority).map(entry => (
            <div className="note-entry" style={{backgroundColor: note.secondaryColour}}>
              <span className="note-entry-priority">{`(${entry.priority})`}</span>
              <span className="note-entry-text">{entry.text}</span>
              {entry.dueDate != null && (<span className="note-entry-date">{`${entry.dueDate?.toLocaleDateString()}`}</span>)}
            </div>
          ))}



          {/*New Entry Form*/}
          {openEntryFormID == note.id && (
          <form className="entry-form" 
            onSubmit={(e) => addItem(note, e)}>
              {/*Priority selector*/}
              <div className="entry-form-section">
                <label htmlFor={`priority-${note.id}`}>Priority</label>
                <select 
                  id={`priority-${note.id}`}
                  value={entryPriority}
                  onChange={e => setEntryPriority(Number(e.target.value))}
                >
                  <option value={0}>0 - Low</option>
                  <option value={1}>1 - Medium</option>
                  <option value={2}>2 - High</option>
                  <option value={3}>3 - Critical</option>
                </select>
              </div>

              {/*Entry Text*/}
              <div className="entry-form-section">
                <label htmlFor={`text-${note.id}`}>Entry</label>
                <textarea
                  id={`text-${note.id}`}
                  value={entryText}
                  onChange={e => setEntryText(e.target.value)}
                  placeholder="New entry..."
                  rows={2}
                />
              </div>

              {/*Due Date*/}
              <div className="entry-form-section">
                <label htmlFor={`date-${note.id}`}>Due Date</label>
                <input
                  id={`date-${note.id}`}
                  type="date"
                  value={entryDueDate}
                  onChange={e => setEntryDueDate(e.target.value)}
                />
              </div>

            <button type="submit" className="entry-submit">Add</button>
          </form>
          )}



          {/*Close form button*/}
          <button type="button" 
            className="toggle-entry-form"
            onClick={() => openEntryFormID == note.id ? setOpenEntryFormID(null) : setOpenEntryFormID(note.id)}>
            {openEntryFormID === note.id ? '⮝' : '⮟'}
          </button>
        </div>

        ))}
      </main>
    </div>
  )
}
