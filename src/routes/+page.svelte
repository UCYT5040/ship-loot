<script lang="ts">
    import type {User} from './+page.server';
    import UserSelect from '$lib/components/UserSelect.svelte';
    import type {PageProps} from '../../.svelte-kit/types/src/routes/$types';
    import PriceMap from '$lib/components/PriceMap.svelte';

    let {data}: PageProps = $props();

    let selectedUser = $state<User | null>(null);
    let item = $state('');
    let itemChosen = $state(false);
</script>

<div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold mb-4">Ship Loot</h1>
    <p class="text-md text-gray-700 mb-8">
        Shop price calculator for <a class="text-blue-500 hover:underline" href="https://shipwrecked.hackclub.com/"
                                     rel="noopener noreferrer" target="_blank" title="Shipwrecked">Hack Club's
        Shipwrecked</a>.
    </p>
    <h2 class="text-2xl font-semibold mb-4">Select a user</h2>
    {#if selectedUser}
        <p class="text-lg mb-1">
            Selected user: <span class="font-bold">{selectedUser.name}</span>
        </p>
        <button class="text-red-500 hover:underline mb-4" onclick={() => selectedUser = null}>
            Go back
        </button>
    {:else}
        <UserSelect
                users={data.users}
                onSelect={(user: User) => {
                selectedUser = user;
            }}
        />
    {/if}
    <h2 class="text-2xl font-semibold mb-4">And an item</h2>
    {#if itemChosen}
        <p class="text-lg mb-2">
            Selected item ID: <span class="font-bold">{item}</span>
        </p>
        <button
                class="text-red-500 hover:underline mb-4"
                onclick={() => {
                item = '';
                itemChosen = false;
            }}
        >
            Go back
        </button>
    {:else}
        <div class="border rounded-lg p-4 bg-white shadow-md w-128 mb-4">
            <p class="text-lg mb-2">
                Find the ID of your item <a href="https://shipwrecked.hackclub.com/api/bay/shop/items"
                                            class="text-blue-500 hover:underline" target="_blank"
                                            rel="noopener noreferrer" title="Shipwrecked API">here</a>. You'll need to
                be logged in.
            </p>
            <p class="text-md mb-2">
                <span class="font-semibold">Remember:</span>
                Not all items have variable pricing.
            </p>
            <input
                    type="text"
                    placeholder="Enter item ID"
                    bind:value={item}
                    class="w-full p-2 border rounded mb-4"
            />
            <button
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
    {#if selectedUser && itemChosen}
        <h2 class="text-2xl font-semibold mb-4">Price Map</h2>
        <p class="text-sm text-gray-600 mb-4">
            Lower percentage = cheaper price.
        </p>
        <PriceMap userId={selectedUser.id} itemId={item}/>
    {/if}
</div>