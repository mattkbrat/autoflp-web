<script lang="ts">
import type { PageData } from "./$types";
import CreditApplicationViewer from "./CreditApplicationViewer.svelte";

export let data: PageData;

const { images, application } = data;
</script>

<CreditApplicationViewer credit={application || {}} {images} />
