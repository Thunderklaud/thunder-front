<script>

    //import * as Crypto from "crypto";


    export const myURL='http://localhost:8080/v1/';
    //export const myURL='https://thunderklaud-api.web2ju.de:8080/v1/';
/*
    export const hashMe = (message) => {
        let mybuffer = new Buffer(message, 'utf-8');
        message = Crypto.webcrypto.subtle.digest('SHA-256', mybuffer);
        return message;
    }

 */

    export async function myfetch(endpoint, cmethod, cbody) {

        await fetch(myURL + endpoint, {
            method: cmethod,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Vary': 'Origin',
                'Sec-Fetch-Mode': 'no-cors'},
            credentials: "include",
            body: JSON.stringify(
                cbody
            )
        })
    }
</script>