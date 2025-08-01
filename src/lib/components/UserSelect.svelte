<script lang="ts">
    import type {User} from '../../routes/+page.server';

    let { users, onSelect }: {
        users: User[],
        onSelect: (user: User) => void
    } = $props();

    let query = $state('');
</script>

<div class="border rounded-lg p-4 bg-white shadow-md w-128 mb-4">
    <input
        type="text"
        placeholder="Search users..."
        bind:value={query}
        class="w-full p-2 border rounded mb-4"
    />
    <ul class="max-h-60 overflow-y-auto">
        {#each users.filter(user => user.name && user.name.toLowerCase().includes(query.toLowerCase())) as user}
            <li>
                <button
                    class="w-full text-left p-2 hover:bg-gray-100"
                    onclick={() => onSelect(user)}
                >
                    {user.name}
                </button>
            </li>
        {/each}
    </ul>
</div>