<script lang="ts">
import { onMount } from "svelte";import type { PageData } from "./$types";import { title } from "$lib/stores";export let data: PageData;onMount(() => {	title.set("Applications");});</script>

<a class="text-lg underline text-blue-200 col-span-full" href={`/credit/blank`}
  >Blank</a
>
<ul class="ml-2 grid grid-cols-1 md:grid-cols-3">
  {#each data.applications as app}
    <li class="contents">
      <span>
        {new Date(app.timestamp).toDateString()}
      </span>
      <span>
        {app.users.email}
      </span>
      <span>
        {app.users.name}
      </span>
    </li>
    <a
      class="text-lg underline text-blue-200 col-span-full"
      href={`/credit/${app.id}`}>Review</a
    >
    <hr class="col-span-full" />
  {/each}
</ul>
