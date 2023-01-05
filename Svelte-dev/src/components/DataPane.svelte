<script>
    import DataComponent from "./DataComponent.svelte";

    // export let parentName;
    let childArr = [
        {id: 1, name: "data01"}, {id: 2, name: "data02"}, {id: 3, name: "data03"}, {id: 4, name: "data04"}
    ];
</script>


<main>
  {#each childArr as dataShow}
    {#if dataShow.id % 2 === 0}
      <div class="even">
        <DataComponent dataName="{dataShow.name}"/>
      </div>
      <script>console.log("even");
      </script>
    {:else}
      <div class="odd">
        <DataComponent dataName="{dataShow.name}"/>
      </div>
      <script>console.log("odd");
      </script>
    {/if}
  {/each}

</main>


<style>
    main {
        float: left;
        margin-left: 1em;
        width: 100%;
    }

    .even {
        background-color: #ccc;
        border-radius: 0.2em;
    }

    .odd {
        background-color: #eee;
        border-radius: 0.2em;
    }

    /*
    tr:nth-of-type(2n+1) { background-color: #fff; }
    */
</style>