<script lang="ts">
import { notEmpty } from "$lib";import type {	ArrayElement,	CreditApplicationWithData,	CreditAppImages,} from "$lib/types";import { onMount } from "svelte";type Credit = NonNullable<Partial<CreditApplicationWithData>>;export let credit: Credit;export let images: CreditAppImages;$: sigPrint = `${	(credit.lastName &&		`${credit.lastName}, ${credit.firstName} ${			credit.middleInitial?.[0] || ""		}`) ||	credit.users?.name ||	""}`;onMount(() => {	for (const [k, v] of Object.entries(credit)) {		if (v) continue;		// @ts-ignore: TOOD: Fix this		credit[k as keyof Credit] = "" as Credit[keyof Credit];	}});$: isRenting = credit.housingOrRenting === "renting";const referenceNumbers = [1, 2, 3, 4, 5, 6] as const;const getReference = (number: number) => {	if (!referenceNumbers.includes(number as 1)) {		return {};	}	const typedNumber = number as 1;	const n = credit[`number_${typedNumber}`];	const street = credit[`street_${typedNumber}`];	const floor = credit[`floor_${typedNumber}`];	const line1 = [street, n && `#${n}`, floor && `f. ${floor}`]		.filter(notEmpty)		.join(" ")		.trim();	return {		name: credit[`name_${typedNumber}`],		street: line1 || "",		city: credit[`city_${typedNumber}`] || "",		state: credit[`state_${typedNumber}`] || "",		zip: credit[`zip_${typedNumber}`] || "",		phone: credit[`phone_${typedNumber}`] || "",		phone2: credit[`phone2_${typedNumber}`] || "",	};};</script>

<div class="grid grid-cols-5">
  <section
    class="print:h-screen grid grid-cols-subgrid col-span-full content-start gap-y-2"
  >
    <h2>Application</h2>
    <fieldset
      class="grid grid-cols-subgrid col-span-full self-start gap-y-2 print:border-2"
    >
      <legend>Applicant</legend>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          readonly={!!credit.lastName}
          class:!text-sm={(credit.lastName?.length || 0) > 20}
          id="lastName"
          class="input col-span-2"
          value={credit.lastName}
        />
        <input
          readonly={!!credit.firstName}
          class:!text-sm={(credit.lastName?.length || 0) > 20}
          id="firstName"
          class="input col-span-2"
          value={credit.firstName}
        />
        <input
          readonly={!!credit.middleInitial?.[0]}
          id="middleInitial"
          class="input"
          value={credit.middleInitial?.[0] || ""}
        />
        <label class="col-span-2" for="lastName">Last Name</label>
        <label class="col-span-2" for="firstName">First Name</label>
        <label for="middleInitial">MI</label>
      </div>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"street"}
          readonly={!!credit.street}
          value={credit.street}
          class="input col-span-4"
        />
        <input
          id={"phone"}
          readonly={!!credit.phone}
          value={credit.phone}
          class="input"
        />
        <hr class="col-span-full" />
        <label for="street" class="col-span-4"> Address Street </label>
        <label class="" for="phone"> Phone # </label>
      </div>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"city"}
          readonly={!!credit.city}
          value={credit.city}
          class="input col-span-2"
        />
        <input
          id={"state"}
          readonly={!!credit.state}
          value={credit.state}
          class="input"
        />
        <input
          id={"zip"}
          readonly={!!credit.zip}
          value={credit.zip}
          class="input"
        />
        <input
          id={"lengthOfStay"}
          readonly={!!credit.lengthOfStayAtAddress}
          value={credit.lengthOfStayAtAddress
            ? `${credit.lengthOfStayAtAddress} Years`
            : ""}
          class="input"
        />
        <label for="city" class="col-span-2"> City </label>
        <label for="state"> State </label>
        <label for="zip"> Zip </label>
        <label for="lengthOfStay"> Length of Stay</label>
      </div>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"ssn"}
          readonly={!!credit.ssn}
          value={credit.ssn}
          class="input col-span-2"
        />
        <input
          id={"driversLicenseNumber"}
          readonly={!!credit.driversLicenseNumber}
          value={credit.driversLicenseNumber}
          class="input"
        />
        <input
          id={"licenseExpiration"}
          readonly={!!credit.licenseExpiration}
          value={credit.licenseExpiration}
          class="input text-sm"
        />
        <input
          id={"dob"}
          readonly={!!credit.dateOfBirth}
          value={credit.dateOfBirth}
          class="input"
        />
        <label for="ssn" class="col-span-2"> Social Security #</label>
        <label for="driversLicenseNumber" class=""> License # </label>
        <label for="licenseExpiration" class=""> License Exp. </label>
        <label for="dob" class="col-span-"> Date of Birth </label>
      </div>
    </fieldset>
    <fieldset
      class="grid grid-cols-subgrid col-span-full self-start gap-y-4 print:border-2"
    >
      <legend>Employment History</legend>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"company"}
          readonly={!!credit.company}
          value={credit.company}
          class="input col-span-3"
        />
        <input
          id={"lengthOfEmployment"}
          readonly={!!credit.employmentLength}
          value={credit.employmentLength
            ? `${credit.employmentLength} ${Number(credit.employmentLength) > 1 ? "years" : "year"}`
            : ""}
          class="input col-span-2"
        />
        <label for="company" class="col-span-3"> Name </label>
        <label for="lengthOfEmployment" class="col-span-2">
          Length of Employment
        </label>
      </div>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"companyAddress"}
          readonly={!!credit.companyAddress}
          value={credit.companyAddress}
          class="input col-span-3"
        />
        <input
          id={"companyPhone"}
          readonly={!!credit.companyTel}
          value={credit.companyTel}
          class="input col-span-2"
        />
        <label for="companyAddress" class="col-span-3"> Address </label>
        <label for="companyPhone" class="col-span-2"> Phone #</label>
      </div>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"supervisor"}
          readonly={!!credit.supervisor}
          value={credit.supervisor}
          class="input col-span-3"
        />
        <input
          id={"department"}
          readonly={!!credit.department}
          value={credit.department}
          class="input col-span-2"
        />
        <label for="supervisor" class="col-span-3"> Supervisor </label>
        <label for="department" class="col-span-2"> Department </label>
      </div>
      <div class="grid grid-cols-subgrid col-span-full self-start">
        <input
          id={"description"}
          readonly={!!credit.jobDescription}
          value={credit.jobDescription}
          class="input col-span-3"
        />
        <input
          id={"income"}
          readonly={!!credit.income}
          value={credit.income}
          class="input col-span-2"
        />
        <label for="description" class="col-span-3"> Job Description </label>
        <label for="income" class="col-span-2"> Monthly Income ($) </label>
      </div>
    </fieldset>
    <fieldset
      class="flex flex-col col-span-full self-start gap-y-4 print:border-2"
    >
      <legend> Housing / Renting Information </legend>
      <div class="flex flex-row gap-x-2">
        <fieldset class="grid grid-cols-[auto_1fr] content-center">
          <label
            class="radio-label grid grid-cols-subgrid col-span-full gap-x-2"
            for="housing"
          >
            <input
              type="radio"
              name="housingOrRenting"
              id="housing"
              value="housing"
              class="radio"
              readonly={!!credit.housingOrRenting}
              checked={credit.housingOrRenting === "housing"}
              on:change={(e) => {
                if (!e.target.checked) {
                  return;
                }
                credit.housingOrRenting = "housing";
              }}
            />
            <span> Housing </span>
          </label>
          <label
            class="radio-label grid grid-cols-subgrid col-span-full gap-x-2"
            for="renting"
          >
            <input
              type="radio"
              name="housingOrRenting"
              id="renting"
              value="renting"
              class="radio"
              readonly={!!credit.housingOrRenting}
              on:change={(e) => {
                if (!e.target.checked) {
                  return;
                }
                credit.housingOrRenting = "renting";
              }}
              checked={isRenting}
            />
            <span> Renting </span>
          </label>
        </fieldset>
        <fieldset class="grid grid-cols-4 col-span-2 flex-1">
          <label for="paymentPerMonth" class="radio-label">
            Monthly Pmt. ($)
          </label>
          <input
            id={"paymentPerMonth"}
            readonly={isRenting ? !!credit.rentpayment : !!credit.ownPayment}
            value={isRenting ? credit.rentpayment : credit.ownPayment}
            class="input col-span-3"
          />
          <hr class="col-span-full" />
          <label for="ownersName" class="radio-label">
            {isRenting ? "Landlord's Name" : "Mortgage Company"}
          </label>
          <input
            id={"ownersName"}
            readonly={isRenting ? !!credit.landlordname : !!credit.mortgage}
            value={isRenting ? credit.landlordname : credit.mortgage}
            class="input col-span-3"
          />
          <hr class="col-span-full" />
          <label for="ownersPhone" class="radio-label"> Phone Number </label>
          <input
            id={"ownersPhone"}
            readonly={isRenting ? !!credit.landlordphone : !!credit.ownphone}
            value={(isRenting ? credit.landlordphone : credit.ownphone) || ""}
            class="input col-span-3"
          />
          <hr class="col-span-full" />
        </fieldset>
      </div>
    </fieldset>
    <hr class="col-span-full" />
    <fieldset
      class="grid grid-cols-subgrid col-span-full self-start gap-y-4 print:border-2"
    >
      <p class="col-span-full">
        I CERTIFY THAT THE ABOVE INFORMATION IS COMPLETE AND ACCURATE. YOU ARE
        AUTHHORIZED TO INVESTIGATE MY CREDIT AND EMPLOYMENT HISTORY AND TO
        RELEASE INFORMATION.
      </p>
      <div class="grid grid-cols-4 col-span-full self-start">
        <input
          id={"print"}
          readonly={!!credit.lastName}
          value={sigPrint}
          class="input col-span-3"
        />
        <input
          id={"date"}
          readonly
          value={new Date(credit.timestamp || new Date())
            .toISOString()
            .split("T")[0]}
          class="input"
        />
        <label for="print" class="col-span-3"> print </label>
        <label for="date" class=""> date </label>
        <input id={"sign"} readonly class="input col-span-full" />
        <label for="sign" class="col-span-full"> sign </label>
      </div>
    </fieldset>
  </section>
  <hr class="col-span-full print:hidden" />
  <section
    class="print:h-screen grid grid-cols-subgrid col-span-full content-start gap-y-2"
  >
    <h2 class="uppercase col-span-full">Personal References</h2>
    <p class="uppercase col-span-full">Please list at least Four.</p>
    <div class="grid-cols-subgrid grid col-span-full">
      <fieldset class="flex col-span-full flex-col print:border-2">
        {#each Array.from(new Array(3).keys()) as index}
          <div class="flex-1 flex flex-row gap-x-1">
            {#each Array.from(new Array(2 + index).keys()).slice(index) as key}
              {@const refNum = index + key + 1}
              {@const reference = getReference(refNum)}
              <fieldset class="!text-sm">
                <legend>Reference #{refNum} </legend>
                <input
                  readonly={!!reference.name}
                  value={reference.name}
                  class="input"
                  placeholder="Name"
                />
                <input
                  readonly={!!reference.street}
                  value={reference.street}
                  class="input"
                  placeholder="Address Line 1"
                />
                <input
                  readonly={!!reference.city}
                  value={reference.city}
                  placeholder="City"
                  class="input"
                />
                <div class="flex">
                  <input
                    readonly={!!reference.state}
                    value={reference.state}
                    placeholder="State"
                    class="input"
                  />
                  <span>,</span>
                  <input
                    readonly={!!reference.zip}
                    value={reference.zip}
                    placeholder="Zip"
                    class="input"
                  />
                </div>
                <input
                  readonly={!!reference.phone}
                  value={reference.phone}
                  placeholder="Primary phone"
                  class="input"
                />
                <input
                  readonly={!!reference.phone2}
                  value={reference.phone2}
                  placeholder="Secondary phone"
                  class="input"
                />
              </fieldset>
            {/each}
          </div>
        {/each}
      </fieldset>
    </div>
    <fieldset
      class="grid grid-cols-subgrid col-span-full self-start gap-y-4 print:border-2"
    >
      <p class="col-span-full">
        I CERTIFY THAT THE ABOVE INFORMATION IS COMPLETE AND ACCURATE. YOU ARE
        AUTHORIZED TO CONTACT THE LISTED REFERENCES TO CONFIRM MY CHARACTER.
      </p>
      <div class="grid grid-cols-4 col-span-full self-start">
        <input
          id={"print"}
          readonly={!!credit.lastName}
          value={sigPrint}
          class="input col-span-3"
        />
        <input
          id={"date"}
          readonly
          value={new Date(credit.timestamp || new Date())
            .toISOString()
            .split("T")[0]}
          class="input"
        />
        <label for="print" class="col-span-3"> print </label>
        <label for="date" class=""> date </label>
        <input id={"sign"} readonly class="input col-span-full" />
        <label for="sign" class="col-span-full"> sign </label>
      </div>
    </fieldset>
  </section>
  {#if images.length > 0}
    <section class="print:max-h-screen col-span-full content-start space-y-2">
      <h2 class="uppercase flex-1">Image Proofs</h2>
      <div class="flex flex-row flex-wrap">
        {#each images as image}
          {#if image.url}
            <div class="flex flex-col print:h-screen">
              <p class="text-lg underline">
                {image.title.split(".").slice(0, -1).join(".")}
              </p>
              <img
                src={image.url}
                alt={image.title}
                id={image.title}
                class="self-center w-auto max-h-[75dvh]"
              />
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  label:not(.radio-label) {
    font-size: smaller;
    border-top: 1px solid;
  }

  input:not(.radio) {
    font-size: larger;
    text-align: left;
    padding: 0;
    padding-inline: 0.2rem;
    text-transform: uppercase;
  }
</style>
