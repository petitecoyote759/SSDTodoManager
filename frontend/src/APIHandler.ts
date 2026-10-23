


const url = "http://127.0.0.1:5000"





export async function login(email: string, password: string): Promise<[string, string] | null> {

    const loginData = { "email": email, "password": password }

    const response = await fetch(`${url}/api/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    });

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
