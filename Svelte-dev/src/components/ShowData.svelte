<script>
    import DataPane from "./DataPane.svelte";

    export let entry;

    function showDataPane() {
        DataPane.visibility = true;
        if (("dataToShow").className === "invisible") {
            document.getElementById("dataToShow").className = "dataPane";
        } else {
            console.log("funktion aufgerufen, aber nicht ausgeführt");
        }
    }

</script>

<main>
  <div class="navMinor">
    <button type="button" on:click={showDataPane()}>{entry}</button>
  </div>
</main>

<style>
    .navMinor {
        color: #666666;
        border: #000;
        border-radius: 0.5em;
    }
</style>