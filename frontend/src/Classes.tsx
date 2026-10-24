import {darkenColour} from "./DarkenColour"


export class Book {
    constructor(name: string, book_id: string, notes: Note[] = []) {
        this.name = name
        this.notes = notes
        this.book_id = book_id
    }

    name: string
    book_id: string
    notes: Note[]
}



export class Note {
    constructor(
        id: string, name: string, positionX: number, positionY: number, 
        primaryColour: string, entries: Entry[] = [], white_text: boolean = true) {

        this.name = name;

        this.posx = positionX; this.posy = positionY

        this.colour = primaryColour

        this.white_text = white_text


        this.entries = entries

        this.note_id = id
    }

    posx: number
    posy: number
    
    name: string

    colour: string

    white_text: boolean

    entries: Entry[]

    note_id: string
}




export class Entry {
    constructor(
        text: string, priority: number, 
        dueDate: Date | null = null, description: string = "", 
        completion: EntryCompletion = EntryCompletion.NotStarted) {

        this.text = text
        this.priority = priority
        this.due_date = dueDate
        this.description = description
        this.entry_id = crypto.randomUUID()
        this.completion = completion
    }

    entry_id: string
    text: string
    description: string
    priority: number
    due_date: Date | null
    completion: EntryCompletion
}

export enum EntryCompletion {
    NotStarted,
    InProgress,
    Completed,
    Blocked
}





