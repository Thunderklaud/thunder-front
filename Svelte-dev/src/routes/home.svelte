<script>
    import {Link, Route, Router} from "svelte-navigator";
    import Logout from "./logout.svelte";
</script>
<Router>
<Link to="./logout">Logout</Link>
</Router>
<Route path="/" primary={false}>
  <Logout/>
</Route>