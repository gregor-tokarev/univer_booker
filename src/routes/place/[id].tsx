import { cache, createAsync, useParams } from "@solidjs/router";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import { places } from "~/db/schema";
import { For, Show } from "solid-js";

const loadDetail = cache(async (id) => {
  "use server";
  return db.query.places.findFirst({
    where: eq(places.id, id),
    with: { photos: true },
  });
}, "detail");

export default function PlacePage() {
  const params = useParams();
  const detailResource = createAsync(() => loadDetail(params["id"]));

  return (
    <div class="grid grid-cols-12 gap-x-5 px-4 pt-10">
      <Show when={detailResource()}>
        <div class="col-span-12 space-y-10 md:col-span-9">
          <h1 class="text-4xl text-slate-800">{detailResource()?.name}</h1>
          <iframe
            src={detailResource()?.frameLink ?? ""}
            width="100%"
            height="400"
            allowFullScreen="true"
          ></iframe>
          <p class="text-base text-slate-500">
            {detailResource()?.description}
          </p>
          <div class="flex space-x-4 overflow-x-auto">
            <For each={detailResource()?.photos}>
              {(p) => <img class="w-[500px]" src={p.url} alt="" />}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
