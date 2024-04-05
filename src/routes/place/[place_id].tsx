import {
  cache,
  createAsync,
  RouteSectionProps,
  useNavigate,
  useParams,
} from "@solidjs/router";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import { places } from "~/db/schema";
import { createSignal, For, Show } from "solid-js";
import Button from "~/components/ui/Button";

const loadDetail = cache(async (id) => {
  "use server";
  return db.query.places.findFirst({
    where: eq(places.id, id),
    with: { photos: true, applications: true },
  });
}, "detail");

export default function PlacePage(props: RouteSectionProps) {
  const params = useParams();
  const navigate = useNavigate();

  const detailResource = createAsync(() => loadDetail(params["place_id"]));

  const [modalImg, setModalImg] = createSignal("");

  return (
    <div class="grid grid-cols-12 gap-5 px-4 pt-10">
      <Show when={detailResource()}>
        <div class="col-span-12 space-y-10 md:col-span-9">
          <h1 class="text-4xl text-slate-800">{detailResource()?.name}</h1>
          <iframe
            src={detailResource()?.frameLink ?? ""}
            width="100%"
            height="400"
          ></iframe>
          <p class="text-base text-slate-500">
            {detailResource()?.description}
          </p>
          <div class="flex space-x-4 overflow-x-auto">
            <For each={detailResource()?.photos}>
              {(p) => (
                <img
                  class="max-h-[400px]  w-[500px] cursor-pointer"
                  src={p.url}
                  alt=""
                  onClick={() => setModalImg(p.url)}
                />
              )}
            </For>
          </div>
        </div>
        <div class="sticky top-0 col-span-12 self-start rounded-md bg-slate-200 p-4 md:col-span-3">
          <Button
            onClick={() => navigate(`/place/${params["place_id"]}/application`)}
          >
            Засписаться
          </Button>
        </div>
      </Show>
      <Show when={modalImg()}>
        <div class="fixed inset-0">
          <div
            class="absolute inset-0 bg-black/20"
            onClick={() => setModalImg("")}
          ></div>
          <img
            src={modalImg()}
            alt=""
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </Show>
      <div>{props.children}</div>
    </div>
  );
}
