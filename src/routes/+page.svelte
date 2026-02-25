<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    // $inspect(data);
</script>

<form method="post" action="?/logout" use:enhance>
    <button class="bg-red-300 cursor-pointer px-4 py-2">Sign out</button>
</form>

<section class="w-100 flex flex-col mx-auto">
    <h1 class="my-2">Multi-stream</h1>
    <ul class="flex flex-row space-x-4">
        <li>
            {#if data.twitchConnected}
                <span>twitch ok</span>
            {:else}
                <a href="/login/twitch">Connect Twitch</a>
            {/if}
        </li>
        <li>
            {#if data.kickConnected}
                <span>kick ok</span>
            {:else}
                <a href="/login/kick">Connect Kick</a>
            {/if}
        </li>
        <li>
            {#if data.googleConnected}
                <span>Youtube ok</span>
            {:else}
                <a href="/login/google">Connect Youtube</a>
            {/if}
        </li>
    </ul>
    <form method="POST" action="?/setName" class="bg-amber-200 p-4">
        {#if data.twitchConnected}
            <div class="flex flex-col">
                <span class="text-sm">Twitch stream name</span>
                <span class="text-xs">{data.twitchStreamTitle}</span>
            </div>
        {/if}
        {#if data.kickConnected}
            <div class="flex flex-col">
                <span class="text-sm">Kick stream name</span>
                <span class="text-xs">{data.kickStreamTitle}</span>
            </div>
        {/if}
        {#if data.googleConnected}
            <div class="flex flex-col">
                <span class="text-sm">Youtube stream name</span>
                <span class="text-xs">{data.youtubeStreamTitle}</span>
            </div>
        {/if}
        <label class="flex flex-col">
            Name
            <input type="text" name="stream-name" class="bg-amber-100 py-1 px-4" />
        </label>
    </form>
    <form method="POST" action="?/setDescription" class="bg-amber-200 p-4">
        <label class="flex flex-col">
            Description
            <textarea name="stream-name" class="bg-amber-100 py-1 px-4"></textarea>
        </label>
    </form>
</section>
