<script>

    export const myURL = 'http://localhost:8080/v1/';

    export async function hashMe(p) {
        const textAsBuffer = new TextEncoder().encode(p);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
        const mystring = hashBuffer.toString();
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return digest;
    }

    export async function myregister(cbody) {

        await fetch(myURL + "user/registration", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(
                cbody
            )
        })
    }

    export async function mylogin(cbody) {

        await fetch(myURL + "user/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: "include",
            body: JSON.stringify(
                cbody
            )
        })
    }

    export async function mylogout(cbody, email) {

        await fetch(myURL + "user/logout", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: "include",
            body: JSON.stringify(
                "session_info",
                JSON.stringify(cbody),
                email
            )
        })
    }
</script>