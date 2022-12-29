<script>
    import MenuTopic from "./MenuTopic.svelte";
    import ShowData from "./ShowData.svelte"
    import DataPane from "./DataPane.svelte";
    import Thumbnail from "./Thumbnail.svelte";
</script>

<main>
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
    main {
        display: grid;
    }
    .baseMenuSide {
        width: 25%;
        grid-column: 1;
    }
    .dataPane {
        grid-column: 2;
    }

    .metaInfo {
        width: 25%;
        grid-column: 3;
    }

</style>