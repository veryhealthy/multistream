<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    let creating = $state(false);
</script>

<div class="flex flex-row">
    <form method="post" action="?/logout" use:enhance>
        <button class="bg-red-300 cursor-pointer px-4 py-2">Sign out</button>
    </form>
    <h1 class="mx-4 my-2">Multi-stream</h1>
    <ul class="flex flex-row space-x-4">
        <li class="flex">
            {#if !data.twitchConnected}
                <a class="px-3 flex items-center text-white bg-purple-600" href="/login/twitch"
                    >Connect Twitch <span class="ml-2 icon-[mdi--twitch]"></span></a
                >
            {/if}
        </li>
        <li class="flex">
            {#if !data.kickConnected}
                <a class="px-3 flex items-center bg-green-400" href="/login/kick"
                    >Connect Kick <span class="ml-2 icon-[ri--kick-fill]"></span></a
                >
            {/if}
        </li>
        <li class="flex">
            {#if !data.googleConnected}
                <a class="px-3 flex items-center text-white bg-red-500" href="/login/google"
                    >Connect Youtube <span class="ml-2 icon-[mdi--youtube]"></span></a
                >
            {/if}
        </li>
    </ul>
    <a href="/tchat" class="bg-indigo-300 cursor-pointer px-4 py-2 ml-auto">Tchat</a>
</div>

{#if data.error}
    <div class="bg-red-500 p-2">
        <p class="text-white">{data.error}</p>
    </div>
{/if}

<div class="flex w-full">
    <section class="w-6/12 flex flex-col bg-amber-400">
        <form
            method="POST"
            action="?/setStreamInfo"
            use:enhance={() => {
                creating = true;

                return async ({ update }) => {
                    await update();
                    creating = false;
                };
            }}
            class="bg-amber-200 p-4 space-y-4"
        >
            <label class="flex flex-col">
                Name
                <input type="text" name="stream-name" class="bg-amber-100 py-1 px-4" />
            </label>
            <label class="flex flex-col">
                Description (youtube)
                <textarea rows="7" name="stream-description" class="bg-amber-100 py-1 px-4 text-xs"></textarea>
            </label>
            <button
                class="flex items-center px-4 py-2 text-white cursor-pointer {creating
                    ? 'bg-emerald-300'
                    : 'bg-emerald-400'}"
                type="submit"
                >Update stream information
                {#if creating}
                    <span class="ml-2 size-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                {/if}
            </button>
            <span class="inset-0 flex items-center justify-center">
                <input type="hidden" name="twitch-name" />
                <input type="hidden" name="twitch-description" />
                <input type="hidden" name="kick-name" />
                <input type="hidden" name="kick-description" />
            </span>
        </form>
    </section>
    <aside class="w-6/12 flex flex-col px-3">
        {#if data.twitchConnected}
            <div class="flex flex-col">
                <div class="flex flex-row items-center">
                    <span>Twitch</span>
                    <span class="block bg-green-300 w-1 h-1 ml-2 rounded shadow-[0px_0px_5px_2px] shadow-green-300"
                    ></span>
                </div>
                {#await data.twitch}
                    <div class="flex flex-col animate-pulse space-y-1">
                        <div class="w-6/12 h-3 bg-amber-100 rounded-full"></div>
                        <div class="w-4/12 h-3 bg-amber-100 rounded-full"></div>
                    </div>
                {:then twitch}
                    <span class="text-xs">{twitch.title}</span>
                    <span class="text-xs">{twitch.description}</span>
                    <span class="text-xs">{twitch.category}</span>
                {:catch error}
                    <span class="bg-red-500 text-white px-4 text-xs">{error.message}</span>
                {/await}
            </div>
        {/if}
        {#if data.kickConnected}
            <div class="flex flex-col">
                <div class="flex flex-row items-center">
                    <span>Kick</span>
                    <span class="block bg-green-300 w-1 h-1 ml-2 rounded shadow-[0px_0px_5px_2px] shadow-green-300"
                    ></span>
                </div>
                {#await data.kick}
                    <div class="flex flex-col animate-pulse space-y-1">
                        <div class="w-6/12 h-3 bg-amber-100 rounded-full"></div>
                        <div class="w-4/12 h-3 bg-amber-100 rounded-full"></div>
                    </div>
                {:then kick}
                    <span class="text-xs">{kick.title}</span>
                    <span class="text-xs">{kick.description}</span>
                    <span class="text-xs">{kick.category}</span>
                {:catch error}
                    <span class="bg-red-500 text-white px-4 text-xs">{error.message}</span>
                {/await}
            </div>
        {/if}
        {#if data.googleConnected}
            <div class="flex flex-col">
                <div class="flex flex-row items-center">
                    <span>Youtube</span>
                    <span class="block bg-green-300 w-1 h-1 ml-2 rounded shadow-[0px_0px_5px_2px] shadow-green-300"
                    ></span>
                </div>
                {#await data.youtube}
                    <div class="flex flex-col animate-pulse space-y-1">
                        <div class="w-6/12 h-3 bg-amber-100 rounded-full"></div>
                        <div class="w-4/12 h-3 bg-amber-100 rounded-full"></div>
                    </div>
                {:then youtube}
                    <span class="text-xs">{youtube.title}</span>
                    <span class="text-xs">{youtube.description}</span>
                    <span class="text-xs">{youtube.category}</span>
                {:catch error}
                    <span class="bg-red-500 text-white px-4 text-xs">{error.message}</span>
                {/await}
            </div>
        {/if}
    </aside>
</div>
