import {Note, Entry, EntryCompletion, Book} from "../Classes.tsx"
import React, { ChangeEvent, SetStateAction, useEffect, useState } from 'react'
import {darkenColour} from "../DarkenColour"
import "./MainScreen.css"
import { Client } from '../Client'



interface Item {
  id: number
  name: string
  description: string
}

type MainScreenParams = {
    client: Client, 
    setClient: React.Dispatch<SetStateAction<Client | null>>
}



const API = 'http://localhost:5000/api/items'




export function MainScreen({ client, setClient }: MainScreenParams) {

    const [sidebarWidth, setSidebarWidth] = useState(250)
    const [isDragging, setIsDragging] = useState(false)

    const [editingDescription, setEditingDescription] = useState<boolean>(false)
    const [editedDescription, setEditedDescription] = useState<string>("")

    const [items, setItems] = useState<Item[]>([])


    const [editingNoteId, setEditingNoteID] = useState<string | null>(null)
    const [editedNoteName, setEditedNoteName] = useState("")


    const [openEntry, setOpenEntry] = useState<string | null>(null)


    const [openBook, setOpenBook] = useState<Book>(client.books[0])


    const [notes, setNotes] = useState<Note[]>(openBook.notes)

    const [draggingNoteID, setDraggingNoteID] = useState<string | null>(null)
    const dragOffset = React.useRef({ x: 0, y: 0 })


    useEffect(() => { loadItems() }, [])

    async function loadItems() {
    const res = await fetch(API)
    const j = await res.json()
    setItems(j)
    }





    const [contextMenu, setContextMenu] = useState<{noteId: string, x: number, y: number} | null>(null) 

    function handleNoteContextMenu(e: React.MouseEvent<HTMLDivElement>, note: Note) {
      e.preventDefault()

      setContextMenu({
        noteId: note.note_id,
        x: e.clientX,
        y: e.clientY
      })
    }

    function deleteNote(noteId: string) {
      const confirmed = window.confirm("Are you sure you want to delete this note?")

      if (confirmed == false) { return; }

      // Include all notes but the one selected
      setNotes(prev => 
        prev.filter(note => note.note_id !== noteId)
      )

      setContextMenu(null)
    }

    useEffect(() => {
      function handleClickOutside() {
        setContextMenu(null)
      }

      document.addEventListener("click", handleClickOutside)

      return () => {
        document.removeEventListener("click", handleClickOutside)
      }
    })






    function createNote() {
      const r = Math.floor(Math.random() * 100) + 100
      const g = Math.floor(Math.random() * 100) + 100
      const b = Math.floor(Math.random() * 100) + 100 

      setNotes(prev => [...prev, 
        new Note(crypto.randomUUID(), "note", 0, 0, `rgb(${r}, ${g}, ${b})`)]
      )
    }






    function saveNoteName(note: Note) {
    setNotes(previous => 
        previous.map(noteAlt => 
        noteAlt.note_id === note.note_id ?
            {...noteAlt, name: editedNoteName.trim() || noteAlt.name } : noteAlt
        )
    )
    }





    function changeNoteColour(noteId: string, colour: string) {
    setNotes(previous =>
        previous.map(note => 
        note.note_id === noteId ? {...note, 
            colour: colour} : note
        )
    )
    }


    const copyNote = async (note: Note) => {
      await navigator.clipboard.writeText(JSON.stringify(note))
    }


    const [openEntryFormID, setOpenEntryFormID] = useState<string | null>(null)
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
        noteAlt.note_id === note.note_id ?
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






    function saveDescription(entry: Entry, description: string) {
        setNotes(previous => 
            previous.map(noteAlt => ({
                ...noteAlt,
                entries: noteAlt.entries.map(entryAlt =>
                    entryAlt === entry
                        ? { ...entryAlt, description: description }
                        : entryAlt
                )
            }))
        )
        setEditingDescription(false)
    }







    function compareDates(a: Date | null, b: Date | null): number {

    if (a == null) {
        if (b == null) { return 0; }

        return 1
    }
    if (b == null) {
        return -1
    }

    return a < b ? -1 : 1
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
        setDraggingNoteID(note.note_id)
        }

        function dragNote(e: React.PointerEvent<HTMLDivElement>, note: Note) {
        if (draggingNoteID != note.note_id) { return; }

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


        setNotes(previous => previous.map(noteAlt => noteAlt.note_id === note.note_id ? {...noteAlt, posx: positionX, posy: positionY} : noteAlt))
    }







    function handleCompletionChange(noteId: string, entryId: string, event: ChangeEvent<HTMLSelectElement>) {
      const newValue: EntryCompletion = Number(event.target.value) as EntryCompletion


      setNotes((prevNotes: Note[]) => 
        prevNotes.map(note => {
          if (note.note_id !== noteId) { return note; }

          return {
            ...note,
            entries: note.entries.map(entry => 
              entry.entry_id === entryId ? { ...entry, completion: newValue } : entry
            )
          }
        }))
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

      <div className="main-content">
        <div className="top-bar">
          Search...
          <button
          className="save-button"
          onPointerDown={e => {e.stopPropagation()}}
          onClick={() => {
            client.books = client.books.map(book => 
              book === openBook
                ? { ...book, notes: notes}
                : book
            )

            client.save()
          }}
          >Save</button>

          <button
            className="add-note-button"
            onPointerDown={e => {e.stopPropagation()}}
            onClick = {() => {
              createNote()
            }}
          >
            +
          </button>
        </div>

        <main className="list-area">
          



          {notes.map(note => (
            /*Notes*/
            <div key={note.note_id}
              className="note"
              onContextMenu={e => handleNoteContextMenu(e, note)}
              style={{
                left: note.posx,
                top: note.posy,
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${note.colour}`,
                color: note.white_text ? "#FFF" : "#000",
              }}>

                {/*Note Header*/}
              <div className="note-header"
                style={{backgroundColor: note.colour}}

                onPointerDown={e => startNoteDrag(e, note)}
                onPointerMove={e => dragNote(e, note)}
                onPointerUp={() => setDraggingNoteID(null)}
                onPointerCancel={() => setDraggingNoteID(null)}
              > 

                <button 
                  className="note-button note-header-edit-button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => {
                    if (editingNoteId == note.note_id) { 
                      setEditingNoteID(null) } else {
                      setEditingNoteID(note.note_id)
                      setEditedNoteName(note.name)
                      }
                  }} 
                >✎</button>
              
                {/*Either editing or just render the name*/}
                {editingNoteId === note.note_id ? (
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
                      className="note-button note-header-input-save"
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
                  className="note-button note-header-invert-button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => 
                    setNotes(previous =>
                      previous.map(noteAlt => 
                        noteAlt.note_id === note.note_id ? {...noteAlt, white_text: noteAlt.white_text = !noteAlt.white_text} 
                        : noteAlt
                      )
                  )}><span className="note-header-invert-symbol">☼</span>
                </button>

                <button
                  className="note-button note-header-copy-button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => copyNote(note)}
                  >
                  ⮺
                </button>


                <label
                  className="note-button note-colour-button"
                  title="Change note colour"
                  onPointerDown={e => e.stopPropagation()}
                >
                  🎨
                  <input
                    type="color"
                    value={note.colour}
                    onChange={e =>
                      changeNoteColour(note.note_id, e.target.value)
                    }
                    aria-label="Change not colour"
                    />
                </label>


                
            </div>

            {/*Entries*/}
            {note.entries
              .sort((a, b) => compareDates(a.due_date, b.due_date))
              .sort((a, b) => b.priority - a.priority).map((entry, index) => {

              function addPriorityHeader() {

                if (index == 0 || note.entries[index - 1].priority != entry.priority) {
                return (<span className="note-entry-priority">{(() => {
              

                switch (entry.priority) {
                  case 0:
                    return "Low"
                  case 1:
                    return "Medium"
                  case 2:
                    return "High"
                  case 3: 
                    return "Critical"
                  default:
                    return "Error"
                }
                })()}</span>)
                }
              }
          
              
              return (
              <div key={entry.entry_id}>
                {addPriorityHeader()}



                  <div 
                      className={`note-entry ${entry.entry_id === openEntry ? "note-entry-open" : ""}`} 
                      style={{background: entry.entry_id === openEntry 
                        ? "rgba(255, 255, 255, 0.4)"
                        : `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), ${note.colour}`}}
                  >
                    <div className="completion-wrapper">
                      <select
                        className="note-entry-completion"
                        value={entry.completion}
                        onChange={(e) => {handleCompletionChange(note.note_id, entry.entry_id, e)}} 
                      >
                        <option value={EntryCompletion.NotStarted} title="Not Started">🔴</option>
                        <option value={EntryCompletion.InProgress} title="In Progress">🟡</option>
                        <option value={EntryCompletion.Completed} title="Completed">🟢</option>
                        <option value={EntryCompletion.Blocked} title="Blocked">🟣</option>
                      </select>

                      <span className="completion-tooltip">
                        {entry.completion == EntryCompletion.NotStarted && "Not Started"}
                        {entry.completion == EntryCompletion.InProgress && "In Progress"}
                        {entry.completion == EntryCompletion.Completed && "Completed"}
                        {entry.completion == EntryCompletion.Blocked && "Blocked"}
                      </span>
                    </div>

                      <button
                          className="note-entry-button"
                          onPointerDown={e => e.stopPropagation()}
                          onClick={() => 
                              entry.entry_id == openEntry ? setOpenEntry(null) : setOpenEntry(entry.entry_id)
                          }    
                      >
                          <span className="note-entry-text">
                              {entry.text}
                          </span>

                        {entry.due_date != null && (<span className="note-entry-date">{`${entry.due_date?.toLocaleDateString()}`}</span>)}
                      </button>
                  </div>




                  {entry.entry_id === openEntry && (
                      <div className="note-entry-description">
                          {editingDescription ? (
                              <textarea
                                  autoFocus
                                  value={editedDescription}
                                  onChange={e => setEditedDescription(e.target.value)}
                                  onFocus={e => {
                                      const length = e.currentTarget.value.length
                                      e.currentTarget.setSelectionRange(length, length)
                                  }}
                                  onKeyDown={e => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          saveDescription(entry, editedDescription)
                                      }
                                  }}
                                  onBlur={() => {
                                      saveDescription(entry, editedDescription)
                                  }}    
                              />
                          ) : (
                              <div
                                  onClick={() => {
                                      setEditedDescription(entry.description)
                                      setEditingDescription(true)
                                  }}
                              >
                                  {entry.description || <i className="enter-description-default">"Click to add description..."</i>}
                              </div>
                          )}

                          <div className="note-entry-description-buttons">
                            <button
                              className="note-entry-delete"
                              onPointerDown={e => e.stopPropagation()}
                              onClick={() => {
                                const confirmed = window.confirm("Are you sure you want to delete this entry?")

                                if (confirmed == false) { return; }

                                setNotes(previous =>
                                  previous.map(otherNote =>
                                    otherNote.note_id === note.note_id
                                      ? {
                                        ...otherNote,
                                        entries: otherNote.entries.filter(
                                          otherEntry => otherEntry.entry_id !== entry.entry_id
                                        )
                                      }
                                    : otherNote
                                  )
                                )

                                if (openEntry === entry.entry_id) {
                                  setOpenEntry(null)
                                }
                              }}
                            >
                            Delete  
                            </button>  

                            <button
                              className="note-entry-edit"
                            >
                              Edit
                            </button>
                          </div>    
                      </div>
                  )}





              </div>
              )
              })}



            {/*New Entry Form*/}
            {openEntryFormID == note.note_id && (
            <form className="entry-form" 
              onSubmit={(e) => addItem(note, e)}>
                {/*Priority selector*/}
                <div className="entry-form-section">
                  <label htmlFor={`priority-${note.note_id}`}>Priority</label>
                  <select 
                    id={`priority-${note.note_id}`}
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
                  <label htmlFor={`text-${note.note_id}`}>Entry</label>
                  <textarea
                    id={`text-${note.note_id}`}
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    placeholder="New entry..."
                    rows={2}
                  />
                </div>

                {/*Due Date*/}
                <div className="entry-form-section">
                  <label htmlFor={`date-${note.note_id}`}>Due Date</label>
                  <input
                    id={`date-${note.note_id}`}
                    type="date"
                    value ={entryDueDate}
                    onChange={e => setEntryDueDate(e.target.value)}
                  />
                </div>

              <button type="submit" className="entry-submit">Add</button>
            </form>
            )}



            {/*Close form button*/}
            <button type="button" 
              className="toggle-entry-form"
              onClick={() => openEntryFormID == note.note_id ? setOpenEntryFormID(null) : setOpenEntryFormID(note.note_id)}>
              {openEntryFormID === note.note_id ? '⮝' : '⮟'}
            </button>
          </div>

          ))}
        </main>
      </div>


      {/*Right Click Menu*/}
      {contextMenu && (() => {
        const note = notes.find(n => n.note_id === contextMenu.noteId)

        if (note == null) { return null; }

        return (
          <div 
            className="note-context-menu"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
          >
            <button
              type="button"
              onClick={() => deleteNote(note.note_id)}
            >
              Delete note
            </button>

            <button
              type="button"
              onClick={() => {copyNote(note); setContextMenu(null)}}
            >
              Copy note
            </button>
          </div>
        )
      })()}
    </div>
    )
}