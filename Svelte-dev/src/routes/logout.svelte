<script>
    import MyFuncs from "../components/myFuncs.svelte";

    let myFuncs;

    let ajwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE2NzMzMDUzNzQsImlhdCI6MTY3MzMwMTc3NCwic3ViIjoiNjNiYzhlZjJkZDFlZmJjYWM0OTZkNTczIiwidGh1bmRlcl9yb290X2Rpcl9pZCI6eyIkb2lkIjoiNjNiYzhlZjJkZDFlZmJjYWM0OTZkNTc4In19.zORMTnpoVthNJ4SGptZneUlb91pXSRehR8CmUCr6OKbxVa4vQrux_gYSyA1HjrnomKORp1Oh8BchjagxaLaJsA";

    const submit = async () => {
        let claims;
        const response = await myFuncs.logout({ajwt, claims}, "a@a.a").body;
        console.log(response);
    }

</script>
<MyFuncs bind:value={myFuncs}/>
<form on:submit|preventDefault={submit}>
  <button type="submit">Klick mich</button>
</form>
