import {darkenColour} from "./DarkenColour"


export class Book {
    constructor(name: string, notes: Note[] = []) {
        this.name = name
        this.notes = notes
    }

    name: string
    notes: Note[]
}



export class Note {
    constructor(
        id: number, name: string, positionX: number, positionY: number, 
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

    note_id: number
}




export class Entry {
    constructor(
        text: string, priority: number, 
        dueDate: Date | null = null, description: string = "", 
        completion: EntryCompletion = EntryCompletion.NotStarted) {

        this.text = text
        this.priority = priority
        this.dueDate = dueDate
        this.description = description
        this.uuid = crypto.randomUUID()
        this.completion = completion
    }

    uuid: string
    text: string
    description: string
    priority: number
    dueDate: Date | null
    completion: EntryCompletion
}

export enum EntryCompletion {
    NotStarted,
    InProgress,
    Completed,
    Blocked
}





