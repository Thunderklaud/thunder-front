<script>

    import MyFuncs from "../components/myFuncs.svelte";

    let myFuncs;
    let email= '';
    let pw_hash= '';

    const submit = () => {
        myFuncs.myfetch('user/login', 'POST', {email, pw_hash});
        console.log(email,pw_hash);
    }

</script>
<MyFuncs bind:this={myFuncs}/>

<main class="get-info">

  <input bind:value={email} type="email" placeholder="Email">
  <input bind:value={pw_hash} type="password" placeholder="Passwort">
  <button type="submit" on:click={submit}>Login</button>

</main>