<script>
    import UsualApp from "./components/UsualApp.svelte";
    import Register from "./routes/register.svelte";
    import Login from "./routes/login.svelte";
    import Home from "./routes/home.svelte";
    import Projectinfo from "./routes/projectinfo.svelte";
    import Team from "./routes/team.svelte";
    import Impressum from "./routes/impressum.svelte";
    import {Link, Route, Router} from "svelte-navigator";


    //export let name;

</script>

<Router>
  <main>
    <header>
      <Link to="/">Home</Link>
      <Link to="/routes/login">Login</Link>
      <Link to="/routes/register">Registrieren</Link>

      <img id="logo" src='/assets/Logo-V2.png' alt="XD">

    </header>
    <div class="content">
      <Route path="/" primary={false}>
        <Home/>
      </Route>
      <Route path="routes/login" primary={false}>
        <Login/>
      </Route>
      <Route path="routes/register" primary={false}>
        <Register/>
      </Route>
      <Route path="routes/projectinfo"primary={false}>
        <Projectinfo/>
      </Route>
      <Route path="routes/impressum" primary={false}>
        <Impressum/>
      </Route>
      <Route path="routes/team" primary={false}>
        <Team/>
      </Route>
    </div>

    <footer>
      <Link class="mylink" to="/routes/projectinfo">Projektbeschreibung</Link>
      <Link class="mylink" to="/routes/team">Team</Link>
      <Link to="/routes/impressum">Impressum</Link>
      <a class="mylink" href="https://github.com/Thunderklaud/thunder-server/wiki/API" target="_blank" rel="noreferrer">Dokumentation</a>
    </footer>

  </main>
</Router>

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

    .mylink:link, .mylink:visited {
        color: white;
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