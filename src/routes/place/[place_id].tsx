import { useParams } from "@solidjs/router";

export function PlaceId() {
  const params = useParams();
  return <div>{params["place_id"]}</div>;
}
