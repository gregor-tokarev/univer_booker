import { useParams } from "@solidjs/router";

export default function PlacePage() {
  const params = useParams();
  return <div>{params["place_id"]}</div>;
}
