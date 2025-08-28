<script lang="ts">
	import PriceMap from '$lib/components/PriceMap.svelte';

	let userId = $state('');
	let userChosen = $state(false);
	let item = $state('');
	let itemChosen = $state(false);
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<h1 class="mb-4 text-4xl font-bold">Ship Loot</h1>
	<p class="text-md mb-8 text-gray-700">
		Shop price calculator for <a
			class="text-blue-500 hover:underline"
			href="https://shipwrecked.hackclub.com/"
			rel="noopener noreferrer"
			target="_blank"
			title="Shipwrecked">Hack Club's Shipwrecked</a
		>.
	</p>
	<h2 class="mb-4 text-2xl font-semibold">Enter your user ID</h2>
	{#if userChosen}
		<p class="mb-1 text-lg">
			Selected user ID: <span class="font-bold">{userId}</span>
		</p>
		<button
			class="mb-4 text-red-500 hover:underline"
			onclick={() => {
				userId = '';
				userChosen = false;
			}}
		>
			Go back
		</button>
	{:else}
		<div class="mb-4 w-128 rounded-lg border bg-white p-4 shadow-md">
			<p class="mb-2 text-lg">
				Find your user ID <a
					href="https://shipwrecked.hackclub.com/api/users/me"
					class="text-blue-500 hover:underline"
					target="_blank"
					rel="noopener noreferrer"
					title="Shipwrecked User API">here</a
				>. You'll need to be logged in.
			</p>
			<input
				type="text"
				placeholder="Enter your user ID"
				bind:value={userId}
				class="mb-4 w-full rounded border p-2"
			/>
			<button
				class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				onclick={() => {
					if (userId) {
						userChosen = true;
					} else {
						alert('Please enter a valid user ID.');
					}
				}}
			>
				Continue
			</button>
		</div>
	{/if}
	<h2 class="mb-4 text-2xl font-semibold">And an item</h2>
	{#if itemChosen}
		<p class="mb-2 text-lg">
			Selected item ID: <span class="font-bold">{item}</span>
		</p>
		<button
			class="mb-4 text-red-500 hover:underline"
			onclick={() => {
				item = '';
				itemChosen = false;
			}}
		>
			Go back
		</button>
	{:else}
		<div class="mb-4 w-128 rounded-lg border bg-white p-4 shadow-md">
			<p class="mb-2 text-lg">
				Find the ID of your item <a
					href="https://shipwrecked.hackclub.com/api/bay/shop/items"
					class="text-blue-500 hover:underline"
					target="_blank"
					rel="noopener noreferrer"
					title="Shipwrecked API">here</a
				>. You'll need to be logged in.
			</p>
			<p class="text-md mb-2">
				<span class="font-semibold">Remember:</span>
				Not all items have variable pricing.
			</p>
			<input
				type="text"
				placeholder="Enter item ID"
				bind:value={item}
				class="mb-4 w-full rounded border p-2"
			/>
			<button
				class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				onclick={() => {
					if (item) {
						itemChosen = true;
					} else {
						alert('Please enter a valid item ID.');
					}
				}}
			>
				Continue
			</button>
		</div>
	{/if}
	{#if userChosen && itemChosen}
		<h2 class="mb-4 text-2xl font-semibold">Price Map</h2>
		<p class="mb-4 text-sm text-gray-600">Lower percentage = cheaper price.</p>
		<PriceMap {userId} itemId={item} />
	{/if}
</div>
