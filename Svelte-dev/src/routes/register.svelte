<script>
    import MyFuncs from '../components/myFuncs.svelte'

    let myfuncs;

    let firstname = '';
    let lastname = '';
    let email = '';
    let password = '';

    const submit = async () => {
        let pw_hash = await myfuncs.hashMe(password);


        await myfuncs.myregister({firstname, lastname, email, pw_hash} )


        console.log(firstname, lastname, email, pw_hash);
    }
</script>

<MyFuncs bind:this={myfuncs}/>

<form class="get-info" on:submit|preventDefault={submit}>
  <h1>Register User</h1>
  <input bind:value={firstname} placeholder="firstname">
  <input bind:value={lastname} placeholder="lastname">
  <input bind:value={email} type="email" placeholder="foo@bar.falk">
  <!-- TODO password should not be entered as hash even if it's possible to enter clear-->
  <input bind:value={password} type="password" placeholder="your password as hash">
  <button type="submit">Registrieren</button>
</form>