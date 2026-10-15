



export function darkenColour(hex: string, amount: number = 0.2): string {

    hex = hex.replace(/^#/, "")

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
