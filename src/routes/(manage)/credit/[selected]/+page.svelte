<script lang="ts">
import { onMount } from "svelte";import type { PageData } from "./$types";import CreditApplicationViewer from "./CreditApplicationViewer.svelte";import { title } from "$lib/stores";export let data: PageData;const { images, application } = data;onMount(() => {	title.set(`Applications - ${application?.lastName}`);});</script>

<CreditApplicationViewer credit={application || {}} {images} />
