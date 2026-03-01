<script lang="ts">
    const { data } = $props();
    $inspect(data);

    const colorMap = [
        "text-purple-400",
        "text-yellow-400",
        "text-blue-400",
        "text-red-400",
        "text-orange-400",
        "text-green-400",
        "text-stone-400",
    ];
    function getUserColor(username: string) {
        const hash = [...username].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colorMap[hash % colorMap.length];
    }
</script>

<h2>Chats</h2>
<ul>
    {#each data.messages as message}
        <li class="flex p-1 text-sm space-x-1 items-center">
            <div class="size-6 bg-pink-100 rounded">
                {#if message.profile_picture}
                    <img
                        class="flex rounded w-full h-full object-cover"
                        src={message.profile_picture}
                        alt={"profile picture of " + message.username}
                    />
                {/if}
            </div>
            <h6 class={getUserColor(message.username)}>{message.username + ": "}</h6>
            <p>{message.content}</p>
        </li>
    {/each}
</ul>
