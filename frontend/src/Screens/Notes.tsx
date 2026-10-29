import React, { ChangeEvent, SetStateAction, useEffect, useState } from "react"
import { Entry, EntryCompletion, Note, Tag } from "../Classes"
import { Client } from "../Client"






type NoteParams = {
    note: Note, 
    updateNotes: (updater: (prev: Note[]) => Note[]) => void,
    setContextMenu: React.Dispatch<SetStateAction<{noteId: string, x: number, y: number} | null>>,
    client: Client,
    searchFunc: ((text: string) => boolean) | null,
}






export function NoteJSX({note, updateNotes, setContextMenu, client, searchFunc}: NoteParams) {




    
    const [editingDescription, setEditingDescription] = useState<boolean>(false)
    const [editedDescription, setEditedDescription] = useState<string>("")

    const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
    const [editingEntryName, setEditingEntryName] = useState<string>("")

    const [tagMenuEntryId, setTagMenuEntryId] = useState<string | null>(null)
    const [creatingTag, setCreatingTag] = useState<boolean>(false)


    
    const [editingNoteId, setEditingNoteID] = useState<string | null>(null)



    const [openEntry, setOpenEntry] = useState<string | null>(null)


    
    const [newTagName, setNewTagName] = useState<string>("")



    const [draggingNoteID, setDraggingNoteID] = useState<string | null>(null)
    const dragOffset = React.useRef({ x: 0, y: 0 })


    const [editedNoteName, setEditedNoteName] = useState("")











    function handleNoteContextMenu(e: React.MouseEvent<HTMLDivElement>, note: Note) {
        e.preventDefault()

        setContextMenu({
        noteId: note.note_id,
        x: e.clientX,
        y: e.clientY
        })
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








    function saveNoteName(note: Note) {
    updateNotes(previous => 
        previous.map(noteAlt => 
        noteAlt.note_id === note.note_id ?
            {...noteAlt, name: editedNoteName.trim() || noteAlt.name } : noteAlt
        )
    )
    }





    
    
    
        function changeNoteColour(noteId: string, colour: string) {
        updateNotes(previous =>
            previous.map(note => 
            note.note_id === noteId ? {...note, 
                colour: colour} : note
            )
        )
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
    
        updateNotes(previous =>
            previous.map(noteAlt =>
            noteAlt.note_id === note.note_id ?
            { ...noteAlt, entries: [...noteAlt.entries, newEntry] } : noteAlt
            )
        )
    
        setEntryText('')
        setEntryPriority(0)
        setEntryDueDate('')
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


        updateNotes(previous => previous.map(noteAlt => noteAlt.note_id === note.note_id ? {...noteAlt, posx: positionX, posy: positionY} : noteAlt))
    }







    function handleCompletionChange(noteId: string, entryId: string, event: ChangeEvent<HTMLSelectElement>) {
        const newValue: EntryCompletion = Number(event.target.value) as EntryCompletion


        updateNotes((prevNotes: Note[]) => 
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






    function changeTagColour(tagId: string, colour: string) {
        client.tags = client.tags.map(tag =>
        tag.tag_id == tagId 
        ? { ...tag, colour: colour }
        : tag
        )

        updateNotes(prev => 
        prev.map(note => ({
            ...note,
            entries: note.entries.map(entry => ({
            ...entry,
            tags: entry.tags.map(tag => 
                tag.tag_id == tagId ? { ...tag, colour: colour }
                : tag
            )
            }))
        }))
        )
    }




    









    function saveDescription(entry: Entry, description: string) {
        updateNotes(previous => 
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







    function removeTagFromEntry(entryId: string, tagId: string) {
      updateNotes(prev =>
        prev.map(note => ({
          ...note,
          entries : note.entries.map(entry => {
            if (entry.entry_id !== entryId) {
              return entry
            }
            
            return {
              ...entry,
              tags: entry.tags.filter(tag => tag.tag_id != tagId)
            }
          })
        }))
      )
    }






    function applyTagToEntry(entryId: string, tag: Tag) {
      updateNotes(prev => 
        prev.map(note => ({
          ...note,
          entries: note.entries.map(entry => {
            if (entry.entry_id !== entryId) {
              return entry
            }

            if (entry.tags.some(existing => existing.name == tag.name)) {
              // one already exists
              return entry
            }

            return {
              ...entry,
              tags: [...entry.tags, tag]
            }
          })
        }))
      )

      setTagMenuEntryId(null)
      setCreatingTag(false)
      setNewTagName("")
    }
    function createTag(entryId: string) {
      const name = newTagName.trim()

      if (name == "") { return; }

      const existingTag = client.tags.find(
        tag => tag.name.toLowerCase() == name.toLowerCase()
      )

      if (existingTag) {
        applyTagToEntry(entryId, existingTag)
        return;
      }

      const colour = '#FFF'

      const newTag = new Tag(colour, name)

      client.tags.push(newTag)

      applyTagToEntry(entryId, newTag)
    }

    function deleteTag(tagId: string) {
      const tag: Tag | undefined = client.tags.find(cTag => cTag.tag_id == tagId) 
      if (tag == undefined) { return; }

      const confirmed = window.confirm(
        `Are you sure you want to delete the tag '${tag.name}'`
      )

      if (confirmed == false) { return; }

      client.tags = client.tags.filter(cTag => cTag.tag_id != tagId)

      updateNotes(prev =>
        prev.map(note => ({
          ...note,
          entries: note.entries.map(entry => ({
            ...entry,
            tags: entry.tags.filter(eTag => eTag.tag_id != tagId)
          }))
        }))
      )
    }







    function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max); }

    function modifyEntryPrio(entryId: string, change: number) {

        updateNotes(prev =>
            prev.map(note => ({
                ...note,
                entries: note.entries.map(entry => 
                    entry.entry_id == entryId ?
                        { ...entry, priority: clamp(entry.priority + change, 0, 3) }
                        : entry
                ) 
            }))
        )
    }




















    return (
        <div key={note.note_id}
              className={`note`}
              onContextMenu={e => handleNoteContextMenu(e, note)}
              style={{
                left: note.posx,
                top: note.posy,
                background: searchFunc == null ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${note.colour}`
                                                : `rgb(80, 80, 80)`,
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
                      onKeyDown={e => {
                        if (e.key == "Enter") {
                            e.preventDefault()
                            setEditingNoteID(null)
                            saveNoteName(note)
                        }
                      }}
                    />
                  </>
                ) : (
                  <span className="note-header-text">{note.name}</span>
                )}

                <button
                  className="note-button note-header-invert-button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => 
                    updateNotes(previous =>
                      previous.map(noteAlt => 
                        noteAlt.note_id === note.note_id ? {...noteAlt, white_text: noteAlt.white_text = !noteAlt.white_text} 
                        : noteAlt
                      )
                  )}><span className="note-header-invert-symbol">☼</span>
                </button>

                {/*
                <button
                  className="note-button note-header-copy-button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => copyNote(note)}
                  >
                  ⮺
                </button>
                */}

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
                      className={`note-entry ${entry.entry_id === openEntry ? "note-entry-open" : ""} ${
                        (() => {
                            if (searchFunc != null) {
                                return searchFunc(entry.text) ? "entry-match" : "0"
                            }
                            return ""
                        })()}`} 
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
                              entry.entry_id == openEntry && editingEntryId == null ? setOpenEntry(null) : setOpenEntry(entry.entry_id)
                          }    
                      >
                        {((editingEntryId != entry.entry_id || openEntry != entry.entry_id) && (
                            <span className="note-entry-text">
                                {entry.text}
                            </span>                        
                        ))
                        }
                        {
                        ((editingEntryId == entry.entry_id && openEntry == entry.entry_id) && (
                          <div className="note-entry-text-wrapper">
                            <input
                              className="note-entry-text-editing"
                              onKeyDown={e => {
                                if (e.key == "Enter") {
                                  e.preventDefault()
                                  e.currentTarget.blur()
                                }
                              }}  
                              value={editingEntryName}
                              onChange={e => setEditingEntryName(e.target.value)}
                            />
                        
                            <div className="note-entry-prio-switch-wrapper">
                                <button className="note-entry-prio-switch-button"
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={e => modifyEntryPrio(entry.entry_id, 1)}
                                >⮝</button>
                                <button className="note-entry-prio-switch-button"
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={e => modifyEntryPrio(entry.entry_id, -1)}                                
                                >⮟</button>
                            </div>
                        </div>
                          ))
                        }

                        {entry.due_date != null && (<span className="note-entry-date">{`${entry.due_date?.toLocaleDateString()}`}</span>)}
                      </button>
                  </div>




                  {entry.entry_id === openEntry && (
                      <div className="note-entry-description">
                        <div
                          className="note-entry-tags"
                        >
                          {entry.tags.sort((a, b) => a.name < b.name ? -1 : 1).map((tag: Tag, index) => {
                            return (
                              <button 
                                className="tag"
                                key={tag.tag_id}
                                onPointerDown={e => e.stopPropagation()}
                                onClick={() => removeTagFromEntry(entry.entry_id, tag.tag_id)}
                              >
                                <label
                                  className="tag-colour-picker"
                                  title="Change tag colour"
                                  onPointerDown={e => e.stopPropagation()}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <span
                                    className="tag-circle"
                                    style={{ backgroundColor: tag.colour }}
                                  />

                                  <input
                                    type="color"
                                    value={tag.colour}
                                    aria-label={`Change colour of ${tag.name}`}
                                    onChange={e => changeTagColour(tag.tag_id, e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                  />
                                </label>

                                <span>{tag.name}</span>
                              </button>
                            )
                          })}
                          {editingEntryId == entry.entry_id && (
                            <div 
                              className="tag-menu-wrapper"
                              onPointerDown={e => e.stopPropagation()}
                              onClick={e => e.stopPropagation()}
                            >
                              <button 
                                className="tag new-tag-button"
                                onClick={() => {
                                  setTagMenuEntryId(
                                    tagMenuEntryId == entry.entry_id ? null : entry.entry_id
                                  )
                                  setCreatingTag(false)
                                  setNewTagName("")
                                }}
                              >
                                + New Tag
                              </button>

                              {tagMenuEntryId == entry.entry_id && (
                                <div className="tag-menu">
                                  <div className="tag-menu-title">
                                    Select a tag
                                  </div>

                                  {/*Existing Tags*/}
                                  {client.tags.filter(tag => !entry.tags.some(existing => existing.tag_id == tag.tag_id)).map((tag, index) => {
                                    return (
                                      <div key={tag.tag_id} className="tag-menu-option-wrapper">
                                        <button
                                          key={`${tag.name}-${index}`}
                                          className="tag-menu-option"
                                          onClick={() => applyTagToEntry(entry.entry_id, tag)}
                                        >
                                          <span
                                            className="tag-circle"
                                            style={{
                                              width: "10px",
                                              height: "10px",
                                              borderRadius: "50%",
                                              backgroundColor: tag.colour,
                                              flexShrink: 0
                                            }}
                                          /><span>{tag.name}</span>


                                        </button>

                                        

                                        <button
                                          className="tag-menu-delete"
                                          onPointerDown={e => e.stopPropagation()}
                                          title={`Delete ${tag.name}`}
                                          aria-label={`Delete ${tag.name}`}
                                          onClick={e => {
                                            e.stopPropagation()
                                            deleteTag(tag.tag_id)
                                          }}
                                        >
                                          x
                                        </button>
                                      </div>
                                    )
                                  })}

                                  <div className="tag-menu-divider"/>

                                  {!creatingTag ? (
                                    <button
                                      className="tag-menu-option tag-menu-create"
                                      onClick={() => setCreatingTag(true)}
                                    >
                                      <span>+</span>
                                      <span>Create new tag</span>
                                    </button>
                                  ) : (
                                    <form
                                      className="tag-create-form"
                                      onSubmit={e => {
                                        e.preventDefault()
                                        createTag(entry.entry_id)
                                      }}
                                    >
                                      <input
                                        autoFocus
                                        type="text"
                                        value={newTagName}
                                        onChange={e => setNewTagName(e.target.value)}
                                        placeholder="tag name..."
                                        maxLength={40}
                                        onKeyDown={e => {
                                          if (e.key == "Escape") {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setCreatingTag(false)
                                            setNewTagName("")
                                          }
                                        }}
                                      />
                                    </form>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

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

                                updateNotes(previous =>
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
                              onPointerDown={e => e.stopPropagation()}
                              onClick={e => {
                                if (entry.entry_id == editingEntryId) { // save
                                  updateNotes(prev =>
                                    prev.map(prevNote => 
                                      prevNote.note_id == note.note_id ? {
                                        ...prevNote,
                                        entries: prevNote.entries.map(prevEntry =>
                                          prevEntry.entry_id == entry.entry_id ? 
                                          { ...prevEntry, text: editingEntryName.trim()}
                                          : prevEntry
                                        )
                                      } : prevNote
                                    )
                                  )
                                  setEditingEntryId(null)
                                }
                                else { // edit
                                  setEditingEntryId(entry.entry_id) 
                                  setEditingEntryName(entry.text)
                                }
                              }}
                            >
                              {entry.entry_id == editingEntryId ? "Save" : "Edit"}
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
    )
}