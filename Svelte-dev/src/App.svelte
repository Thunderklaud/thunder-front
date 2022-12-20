<script>
    import DataPane from "./components/DataPane.svelte";

    export let name;

    import MenuTopic from "./components/MenuTopic.svelte";
    import ShowData from "./components/showData.svelte"
    import Thumbnail from "./components/Thumbnail.svelte";
    import DataComponent from "./components/DataComponent.svelte";

</script>

<main>
  <div>
    <img id="logo" src='assets/Logo-V2.png' alt="XD">
  </div>
  <div class="baseMenuSide">
    <p>
      <MenuTopic entry="Dateien"/>
      <ShowData entry="Meine Bibliothek"/>
      <MenuTopic entry="Werkzeuge"/>
    </p>
  </div>
  <div id="dataToShow" class="dataPane">
    <p>
      <DataPane/>
    </p>
  </div>
  <div class="metaInfo">
    <p class="thumbnail">
      <Thumbnail entry="Thumbnail"/>
    </p>
  </div>
</main>

<style>
    :global(body) {
        background-color: #000000;
    }

    main {
        background-color: #555;
        color: #999999;
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
        display: block;
    }

    .baseMenuSide {
        display: flex;
        float: left;
    }

    .metaInfo {
        display: flex;
        float: right;
    }

    .thumbnail {
        width: fit-content;
        max-width: 20em;
        background-color: #333333;
        color: #18b218;
        border: #000;
        padding: 1em;
        margin: 1em;
        border-radius: 0.5em;
    }

    .dataPane {
        display: flex;
        float: left;
        width: 3rem;
        color: #333;
    }

    .invisible {
        visibility: hidden;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    #logo {
        max-width: 13rem;
    }


    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }

</style>