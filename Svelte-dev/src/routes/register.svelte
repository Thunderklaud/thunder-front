<script>
    import MyFuncs from '../components/myFuncs.svelte'
    import {prevent_default} from "svelte/internal";
    //import * as Crypto from "crypto";

    let myfuncs;

/*
    async function myfetch(endpoint, cmethod, cbody) {

        await fetch('https://thunderklaud-api.web2ju.de:8080/v1/' + endpoint, {
            method: cmethod,
            headers: {'Content-Type': 'application/json'},
            credentials: "include",
            body: JSON.stringify(
                cbody
            )
        })
    }

 */

    let firstname = '';
    let lastname = '';
    let email = '';
    let pw_hash = '';

    const submit = async () => {
        pw_hash = '988119d6cca702beb1748f4eb497e316467f69580ffa125aa8bcb6fb63dce237';


        await myfuncs.myfetch('user/registration', 'POST',{firstname, lastname, email, pw_hash} )
/*
        fetch('https://localhost:8000/v1/user/registration', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: "include",
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                pw_hash,
            })
        })

 */

        console.log(firstname, lastname, email, pw_hash);
    }
</script>

<MyFuncs bind:this={myfuncs}/>

<form class="get-info">
  <h1>Register User</h1>
  <input bind:value={firstname} placeholder="firstname">
  <input bind:value={lastname} placeholder="lastname">
  <input bind:value={email} type="email" placeholder="foo@bar.falk">
  <!-- TODO password should not be entered as hash even if it's possible to enter clear-->
  <input bind:value={pw_hash} type="password" placeholder="your password as hash">
  <button type="submit" on:click|preventDefault={submit}>Registrieren</button>
</form>