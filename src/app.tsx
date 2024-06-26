import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="mx-auto max-w-[1180px]">
          <Suspense>{props.children}</Suspense>
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
