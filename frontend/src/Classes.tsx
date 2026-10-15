//import {darkenColour} from "./DarkenColour.tsx"


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
        secondaryColour: string | null = null, tertiaryColour: string | null = null) {

        this.name = name;

        this.positionX = positionX; this.positionY = positionY

        this.primaryColour = primaryColour
        this.secondaryColour = secondaryColour === null ? darkenColour(primaryColour, 0.2) : secondaryColour
        this.tertiaryColour = tertiaryColour === null ? darkenColour(primaryColour, 0.4) : tertiaryColour

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

    sortType: string

    entries: Entry[]

    id: number
}




export class Entry {
    constructor(text: string, priority: number, dueDate: Date | null = null) {
        this.text = text
        this.priority = priority
        this.dueDate = dueDate
    }

    text: string
    priority: number
    dueDate: Date | null
}

















function darkenColour(hex: string, amount: number = 0.1): string {

    hex = hex.replace(/^#/, '') // remove leading #

    var r = 0;
    var g = 0;
    var b = 0;

    if (/^[0-9a-fA-F]{3}$/.test(hex)) { // valid 3 digit hex
        r = parseInt(hex[0], 16)
        g = parseInt(hex[1], 16)
        b = parseInt(hex[2], 16)
    }

    if (/^[0-9a-fA-F]{6}$/.test(hex)) { // valid 6 digit hex
        r = parseInt(`${hex[0]}${hex[1]}`, 16)    
        g = parseInt(`${hex[2]}${hex[3]}`, 16)    
        b = parseInt(`${hex[4]}${hex[5]}`, 16)    
    }

    const modifier = 1 - amount;

    const toHex = (value: number) => 
        Math.round(value).toString(16).padStart(2, '0')

    return `#${toHex(r * modifier)}${toHex(g * modifier)}${toHex(b * modifier)}`
}
