<script>

    import MyFuncs from "../components/myFuncs.svelte";

    let token;

    export let auth;

    let myFuncs;
    let email = '';
    let password = '';


    async function submit() {
        let pw_hash = await myFuncs.hashMe(password);
        myFuncs.mylogin({email, pw_hash});
        console.log(email, password, pw_hash);
        auth=true
    }

</script>
<MyFuncs bind:this={myFuncs}/>

<form class="get-info" on:submit|preventDefault={submit}>

  <input bind:value={email} type="email" placeholder="Email">
  <input bind:value={password} type="password" placeholder="Passwort">
  <button type="submit">Login</button>

</form>