import { Book, Note, Entry, EntryCompletion, Tag } from "./Classes";


const url = "http://127.0.0.1:5000"





export async function login(email: string, password: string): Promise<[string, string] | null> {

    const loginData = { "email": email, "password": password }

    var response: Response;
    try {
        response = await fetch(`${url}/api/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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
    const token = data.token
    const uuid = data.uuid

    return [uuid, token]
}




export async function getUserData(uuid: string, token: string) {

    const response = await fetch(`${url}/api/users/${uuid}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
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




export async function getUserBooks(uuid: string, token: string) {

    const response = await fetch(`${url}/api/users/${uuid}/books`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
            "recursive": "true"
        }
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



export async function saveBooks(uuid: string, token: string, books: Record<string, Book[]>) {
    console.log(`Books : ${JSON.stringify(books)}`)
    const response = fetch(`${url}/api/users/${uuid}/books`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
            "recursive": "true"
        },
        body: JSON.stringify(books)
    });
}