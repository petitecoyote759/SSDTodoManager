import { Book, Note, Entry, EntryCompletion, Tag } from "./Classes";


const url = "http://localhost:5000"












export async function checkCurrentUser() {
    var response: Response
    try {
        response = await fetch(`${url}/api/user/auth`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            console.log(`checkCurrentUser errored, response - ${await response.text()}`)
            return null;
        }

        const data = await response.json();
        return data.uuid;
    } catch (e) {
        console.error("Session check failed:", e)
        return null
    }
}







export async function login(email: string, password: string): Promise<string | null> {

    const loginData = { "email": email, "password": password }

    var response: Response;
    try {
        response = await fetch(`${url}/api/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(loginData)
        });
    }
    catch (error) {
        console.error(`Something went wrong during login. Error: ${error}`)
        return null
    }

    if (!response.ok) {
        console.error(
            `Something went wrong during login. Error: ${response.status}`,
            await response.text()
        );
        return null
    }

    const data = await response.json()
    console.log(data)
    const uuid = data.uuid

    return uuid
}




export async function getUserData(uuid: string) {

    const response = await fetch(`${url}/api/users/${uuid}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });


    if (!response.ok) {
        console.error(
            `Something went wrong getting user data. Error: ${response.status}`,
            await response.text()
        );
        return null
    }

    const data = await response.json()
    const username = data.username
    const email = data.email
    const profile_picture = data.profile_picture
    const created_at = data.created_at

    return [username, email, profile_picture, created_at]
}




export async function getUserBooks(uuid: string) {

    const response = await fetch(`${url}/api/users/${uuid}/books`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "recursive": "true"
        },
        credentials: "include"
    });


    if (!response.ok) {
        console.error(
            `Something went wrong getting user data. Error: ${response.status}`,
            await response.text()
        );
        return null
    }

    const json = await response.json()
    console.log(`JSON = ${JSON.stringify(json["books"])}`)

    return (json.books ?? []).map((bookData: any) => 
        new Book(
            bookData.name,
            bookData.book_id,
            (bookData.notes ?? []).map((noteData: any) => 
                new Note(noteData.note_id,
                    noteData.name,
                    noteData.posx,
                    noteData.posy,
                    noteData.colour,
                    (noteData.entries ?? []).map((entryData: any) =>
                        Object.assign(
                            new Entry(
                                entryData.text,
                                entryData.priority,
                                entryData.due_date
                                    ? new Date(entryData.due_date)
                                    : null,
                                entryData.description,
                                entryData.completion,
                                (entryData.tags ?? []).map((tagsData: any) =>
                                    new Tag(tagsData.colour, tagsData.name, tagsData.tag_id)
                                )
                            ),
                            {
                                entry_id: entryData.entry_id
                            }
                        )
                    ),
                    noteData.white_text
                )
            )
        )
    )   
}




export async function getUsersTags(uuid: string) {

    const response = await fetch(`${url}/api/users/${uuid}/tags`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
    

    if (!response.ok) {
        console.error(
            `Something went wrong getting user tags. Error: ${response.status}`,
            await response.text()
        );
        return null
    }


    const values = await response.json();
    return (
        values.tags.map((tagData: any) => new Tag(tagData.colour, tagData.name, tagData.tag_id))
    )
}






export async function saveBooks(uuid: string, books: Record<string, Book[]>) {
    
    const response = fetch(`${url}/api/users/${uuid}/books`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "recursive": "true"
        },
        body: JSON.stringify(books),
        credentials: "include"
    });
}


export async function saveTags(uuid: string, tags: Record<string, Tag[]>) {
    const response = fetch(`${url}/api/users/${uuid}/tags`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(tags)
    });
}