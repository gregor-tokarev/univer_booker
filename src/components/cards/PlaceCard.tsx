import { InferSelectModel } from "drizzle-orm";
import { photos, places } from "~/db/schema";
import { RiMapPin2Line } from "solidjs-remixicon";
import { A } from "@solidjs/router";

export interface PlaceCardProps {
  place: InferSelectModel<typeof places> & {
    photos: InferSelectModel<typeof photos>[];
  };
}

export function PlaceCard(props: PlaceCardProps) {
  return (
    <div class="overflow-hidden rounded bg-slate-50">
      <img
        class="max-h-[400px] w-full object-cover"
        src={props.place.photos[0].url}
        alt={props.place.name}
      />
      <div class="p-5">
        <A
          href={`/place/${props.place.id}`}
          class="mb-1 text-left text-2xl text-sky-900"
        >
          {props.place.name}
        </A>
        <a
          href={props.place.mapLink}
          target="_blank"
          class="text-md mb-3 flex items-center space-x-2 text-slate-400"
        >
          <RiMapPin2Line size="16px"></RiMapPin2Line>
          <span>{props.place.mapLink}</span>
        </a>
        <p class="mb-4 text-slate-600">{props.place.description}</p>
        <div class="relative flex items-center space-x-2">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <span class="relative inline-flex h-full w-full rounded-full bg-sky-500"></span>
          </span>
          <span class="text-sky-500">Есть окно на этой неделе</span>
        </div>
      </div>
    </div>
  );
}
