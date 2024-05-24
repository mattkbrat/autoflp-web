<script lang="ts">
export let data;

$: contact = data.account.contact;
</script>

<div>Accounts</div>
{#if contact.lastName}
  <h2>{contact.lastName} {contact.firstName}</h2>
{:else}
  <h2>New</h2>
{/if}
