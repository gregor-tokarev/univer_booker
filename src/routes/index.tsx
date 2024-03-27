import { cache, createAsync } from "@solidjs/router";
import { db } from "~/db";
import { For, Show } from "solid-js";
import { PlaceCard } from "~/components/cards/PlaceCard";

const loadPlaces = cache(() => {
  "use server";
  return db.query.places.findMany({ with: { photos: true } });
}, "places");

export const route = {
  load: () => loadPlaces(),
};

export default function Home() {
  const placesResource = createAsync(() => loadPlaces());

  return (
    <main class="mx-auto grid gap-4 p-4 text-gray-700 md:grid-cols-2">
      <Show when={placesResource()}>
        <For each={placesResource()}>
          {(p) => (
            <>
              {" "}
              <PlaceCard place={p} /> <PlaceCard place={p} />
            </>
          )}
        </For>
      </Show>
    </main>
  );
}
