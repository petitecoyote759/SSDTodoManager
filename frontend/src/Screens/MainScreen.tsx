import {Note, Entry, EntryCompletion, Book, Tag} from "../Classes.tsx"
import React, { ChangeEvent, SetStateAction, useEffect, useState } from 'react'
import {darkenColour} from "../DarkenColour"
import "./MainScreen.css"
import { Client } from '../Client'
import { NoteJSX } from "./Notes.tsx"



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



    const [bookSearch, setBookSearch] = useState<string>("")
    const [topSearch, setTopSearch] = useState<string>("")
    const [searchFunc, setSearchFunc] = useState<string | null>(null)


    const [changesMade, setChangesMade] = useState<boolean>(false)



    const [bookFormOpen, setBookFormOpen] = useState<boolean>(false)

    const [userOpen, setUserOpen] = useState<boolean>(false)


    const [openBook, setOpenBook] = useState<Book>(client.books.length == 0 ? new Book("<<DEFAULT_BOOK>>", "") : client.books[0])
    const [dashboard, setDashboard] = useState<{bookId: string, x: number, y: number} | null>(null)


    const [notes, setNotes] = useState<Note[]>(openBook.notes)




    const [contextMenu, setContextMenu] = useState<{noteId: string, x: number, y: number} | null>(null) 
    const [bookContextMenu, setBookContextMenu] = useState<{bookId: string, x: number, y: number} | null>(null)






    
    // Source - https://stackoverflow.com/a/44134328
    // Posted by Juraj, modified by community. See post 'Timeline' for change history
    // Retrieved 2026-10-24, License - CC BY-SA 4.0
    function hslToHex(h: number, s: number, l: number): string {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }

    function createNote() {
      const h = Math.floor(Math.random() * 360)
      const s = Math.floor(Math.random() * 70) + 20
      const l = Math.floor(Math.random() * 70) + 20 

      updateNotes(prev => [...prev, 
        new Note(crypto.randomUUID(), "note", 0, 0, hslToHex(h, s, l))]
      )
    }








    useEffect(() => {
      const book: Book | undefined = client.books.find((v) => v.book_id == openBook.book_id)
      if (book != null) {
        book.notes = notes
      }
    }, [notes])

    useEffect(() => {
      setNotes(openBook.notes)
    }, [openBook])






    const [bookFormName, setBookFormName] = useState<string>("")
    function createBook(name: string, e: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0]) {
      e.preventDefault()
      if (name == "") { return; }

      const book: Book = new Book(name, crypto.randomUUID())
      client.books.push(book)
      if (openBook.book_id == "") 
      { 
        setOpenBook(book) 
      }

      setBookFormOpen(false)
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







    function deleteNote(noteId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this note?")

        if (confirmed == false) { return; }

        // Include all notes but the one selected
        updateNotes((prev: Note[]) => 
        prev.filter(note => note.note_id !== noteId)
        )

        setContextMenu(null)
    }
    function deleteBook(bookId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this book?")

        if (confirmed == false) { return; }

        if (openBook.book_id == bookId) { setOpenBook(new Book("<<DEFAULT_BOOK>>", "")) }

        client.books = client.books.filter(book => book.book_id != bookId)

        setBookContextMenu(null)
    }

    
    const copyNote = async (note: Note) => {
      await navigator.clipboard.writeText(JSON.stringify(note))
    }
    


    
    


    function handleBookContextMenu(e: React.MouseEvent<HTMLDivElement>, book: Book) {
        e.preventDefault()

        setBookContextMenu({
        bookId: book.book_id,
        x: e.clientX,
        y: e.clientY
        })
    }


    useEffect(() => {
        function handleClickOutside() {
        setBookContextMenu(null)
        }

        document.addEventListener("click", handleClickOutside)

        return () => {
        document.removeEventListener("click", handleClickOutside)
        }
    })

    












    
    // << Dragging Dashboard >> //
    const [draggingDashboard, setDraggingDashboard] = useState<boolean>(false)
    const dragOffset = React.useRef({x: 0, y: 0})

    function startDraggingDashboard(e: React.PointerEvent<HTMLDivElement>) {

      if (dashboard == null) { return; }

      e.preventDefault()

      e.currentTarget.setPointerCapture(e.pointerId)

      dragOffset.current = {
        x: e.clientX - dashboard.x,
        y: e.clientY - dashboard.y
      } 

      setDraggingDashboard(true)
      console.log(`Starting Drag = ${dragOffset}`)
    }


    function dragDashboard(e: React.PointerEvent<HTMLDivElement>) {

      if (dashboard == null || draggingDashboard == false || dragOffset == null) { return; }

      setDashboard({bookId: dashboard.bookId, x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y})
      console.log(`Dragging`)
    }
    














    function updateNotes(
      updater: (previous: Note[]) => Note[]
    ) {
      setNotes(updater)
      setChangesMade(true)
    }



    return (
      <div className="app">
        <aside className="sidebar" style={{width : sidebarWidth}}>
          {/*Books Bar*/}
          <div className="bookBar">
            <div className="bookBar-title">
              <h1 className="books-title">Books</h1>
            </div>
            <div className="bookBar-tools">
              <div className="bookBar-search">
                <textarea 
                  placeholder="search books..."
                  onKeyDown={e => {
                    if (e.key == "Enter") {
                      e.preventDefault()
                      e.currentTarget.blur()
                    }
                  }}  
                  onChange={e => setBookSearch(e.target.value)}
                >
                </textarea>
              </div>
            </div>
            {bookFormOpen && (() =>
              <div className="create-book-form-wrapper">
                <h3 className="create-book-form-title">Create Book</h3>

                <form 
                  className="create-book-form"
                  onSubmit={(e) => createBook(bookFormName, e)}
                >
                  <div className="book-form-section">
                    <textarea
                      id={`book-name`}
                      value={bookFormName}
                      onChange={e => setBookFormName(e.target.value)}
                      placeholder="book name..."
                    />
                  </div>
                  <button type="submit" className="book-form-submit">Create</button>
                </form>
              </div>
            )()}
            <button className="bookBar-create-open"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => {setBookFormOpen(!bookFormOpen); setBookFormName("")}}
            >
              {bookFormOpen === true ? '⮝' : '⮟'}
            </button>


            
            {/*Books go here*/}
            {client.books
              .filter((b) => { 
                if (b.book_id == "") return false 
                
                try {
                  const regex = new RegExp(bookSearch, "i")
                  return regex.test(b.name)
                } catch {
                  return false
                }
              })
              .map((book, index) => (
                <div key={book.book_id} className={`book ${book.book_id == openBook.book_id ? 'open-book' : ''}`}
                  onContextMenu={e => handleBookContextMenu(e, book)}
                >
                  <button
                    className="book-button"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.preventDefault(); setOpenBook(book); }}
                    value={bookSearch}
                  >
                    {book.name}
                  </button>
                </div>
              ))
            }
          </div>


        

          {/*User Profile*/}
          <div className="user-profile">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => setUserOpen(!userOpen)}
            >
              {/*Profile Picture*/}
              {client.username}
              {/*Add onclick stuff to show info*/}
            </button>

            {userOpen && (
              <div
                className="user-settings"
              >
                <div className="user-settings-entry">
                  <button 
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => {client.logout(); setClient(null)}}
                  >Logout</button>
                </div>
                <button 
                  className="user-settings-entry" 
                  onPointerDown={e => e.stopPropagation()}                 
                >Other</button>
              </div>
            )}
          </div>
        </aside>

        <div 
          className={`resize-handle ${isDragging ? 'dragging': ''}`}
          onMouseDown={startResize}
        />

      <div className="main-content">
        <div className="top-bar">
          

          <input
            className="note-search"
            placeholder="search notes..."
            onKeyDown={e => {
              if (e.key == "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}  
            onChange={
              e => {
                setTopSearch(e.target.value)
                const searchText = e.target.value


                if (searchText == "") {
                  setSearchFunc(null)
                  return;
                }

                try {
                  setSearchFunc(searchText)
                } catch (e) {
                  console.log(`Error: ${e}`)
                }
              }
            }
          >
          </input>


          <button
          className={`save-button`}
          onPointerDown={e => {e.stopPropagation()}}
          disabled={!changesMade}
          onClick={() => {
            client.books = client.books.map(book => 
              book === openBook
                ? { ...book, notes: notes}
                : book
            )

            client.save()
            setChangesMade(false)
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







        {/* Main area only open if there is a book */}
        {openBook.book_id != "" && (() => 
        <main className="list-area">
          {notes.map(note => (
            /*Notes*/
            <NoteJSX note={note} updateNotes={updateNotes} setContextMenu={setContextMenu} client={client} searchFunc={searchFunc}/>

          ))}
        </main>
        )()}







        {/*  */}
        {openBook.book_id == "" && (() =>
        <main className="no-books-area">
          <div className="no-books-text">
            Click on a book or create a new one to start!
          </div>
        </main>
        )()}

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



      {/*Book Right Click Menu*/}
      {bookContextMenu && (() => {
        const book = client.books.find(b => b.book_id == bookContextMenu.bookId)

        if (book == null) {return null}

        return (
          <div
            className="note-context-menu"
            style={{
              left: bookContextMenu.x,
              top: bookContextMenu.y
            }}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
          > 

            <button
              type="button"
              onClick={() => {deleteBook(book.book_id); setChangesMade(true)}}
            >
              Delete Book
            </button>


            <button
              type="button"
              onClick={() => {setDashboard({bookId: bookContextMenu.bookId, x: 100, y: 100}); setBookContextMenu(null)}}
            >
              Open Dashboard
            </button>

          </div>
        )
      })()
    }



      {/*Dashboard*/}
      {dashboard && (() => {
        const book = client.books.find(b => b.book_id == dashboard.bookId)

        if (book == null) { setDashboard(null); return null; }

        return (
          <div
            className="dashboard"
            style={{left: dashboard.x, top: dashboard.y}}

            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <div className="dashboard-header"
                onPointerDown={e => startDraggingDashboard(e)}
                onPointerMove={e => dragDashboard(e)}
                onPointerUp={() => setDraggingDashboard(false)}
                onPointerCancel={() => setDraggingDashboard(false)}
            >
              <h1>Dashboard</h1>
              <button
                type="button"
                onClick={e => setDashboard(null)}
              >
                X
              </button>
            </div>

            <div className="dashboard-seperator"/>

          </div>
        )
      })()

      }
    </div>
    )
}