<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { fullNameFromPerson } from "$lib/format";
import { type NavType, handleAccNav } from "$lib/navState";
import { allAccounts, selectedStates } from "$lib/stores";
// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";
export let baseRoute: "account" | "deal" | "payment" | "person" = "account";

import { accountID, handleSelect } from "$lib/stores/selected";

$: console.log(baseRoute, navType);
</script>

<select
  required
  id="account-select"
  name="account"
  on:blur={(e) => {
    if (
      !e.target ||
      !("value" in e.target) ||
      typeof e.target.value !== "string"
    ) {
      console.log("invalid state", e.target);
      return;
    }
    handleSelect(baseRoute, e.target.value, navType);
  }}
  value={$accountID.value}
  class="bg-surface-800 text"
>
  <option value={navType === "query" ? "" : "new"}>Select an account</option>
  {#each $allAccounts as { id, contact, licenseNumber }}
    {@const value = baseRoute === "person" ? contact.id : id}
    {@const fullName = fullNameFromPerson({ person: contact })}
    <option {value}>{fullName} | {licenseNumber}</option>
  {/each}
</select>
