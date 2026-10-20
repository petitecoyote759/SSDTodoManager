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
        primaryColour: string, sortType: string = "ALPH", entries: Entry[] = [], 
        secondaryColour: string | null = null, tertiaryColour: string | null = null, textColour: string = "white") {

        this.name = name;

        this.positionX = positionX; this.positionY = positionY

        this.primaryColour = primaryColour
        this.secondaryColour = secondaryColour === null ? darkenColour(primaryColour, 0.2) : secondaryColour
        this.tertiaryColour = tertiaryColour === null ? darkenColour(primaryColour, 0.4) : tertiaryColour

        this.textColour = textColour

        this.sortType = sortType

        this.entries = entries

        this.id = id
    }

    positionX: number
    positionY: number
    
    name: string

    primaryColour: string
    secondaryColour: string
    tertiaryColour: string

    textColour: string

    sortType: string

    entries: Entry[]

    id: number
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





