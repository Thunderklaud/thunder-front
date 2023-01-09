<script>
    import UsualApp from "./components/UsualApp.svelte";
    import Register from "./routes/register.svelte";
    import Login from "./routes/login.svelte";
    import Footer from "./components/Footer.svelte";

    export let name;

</script>

<main>
  <header>
    <div>
      <img id="logo" src='assets/Logo-V2.png' alt="XD">
    </div>
  </header>
  <div class="content">
    <!--<UsualApp/>-->
    <Register/>
  </div>
  <footer>
    <Footer/>
  </footer>

</main>

<style>
    :global(body) {
        background-color: #000000;
    }

    main {
        display: grid;
        background-color: #555;
        color: #999999;
    }

    header {
        grid-row: 1;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 5rem;
        background-color: red;
        color: white;
        text-align: center;
    }

    .content {
        grid-row: 2;
        height: 51rem;
        margin-top: 5rem;
        margin-bottom: 4rem;
    }

    footer {
        grid-row: 3;
        position: sticky;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 4rem;
        background-color: red;
        color: white;
        text-align: center;
    }




    /*
        .invisible {
            visibility: hidden;
        }

        h1 {
            color: #ff3e00;
            text-transform: uppercase;
            font-size: 4em;
            font-weight: 100;
        }

     */

    #logo {
        width: 13rem;
    }


    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

</style>