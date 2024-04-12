import {
  action,
  cache,
  createAsync,
  useAction,
  useSubmission,
} from "@solidjs/router";
import { db } from "~/db";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import dayjs from "dayjs";
import { Portal } from "solid-js/web";
import { z } from "zod";
import {
  createForm,
  getValues,
  setValues,
  zodForm,
} from "@modular-forms/solid";
import { TextInput } from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";
import { desc, eq } from "drizzle-orm";
import { applicationApprovals, applications } from "~/db/schema";
import objectPath from "object-path";
import { getAdmin } from "~/lib/getAdmin";
import { getCookie } from "vinxi/http";

const applicationsQuery = cache(async () => {
  "use server";

  return db.query.applications
    .findMany({
      with: { user: true, approval: true },
      orderBy: desc(applications.timeStart),
    })
    .execute();
}, "applications");

const toggleApproval = action(
  async (
    values: approvalFormType & { approve: boolean; applicationId: string },
  ) => {
    "use server";

    const sessionId = getCookie("__sessionId")!;

    const admin = await getAdmin(sessionId);

    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, values.applicationId))
      .execute();

    if (application.approval) {
      return db
        .update(applicationApprovals)
        .set({
          approved: values.approve,
          message: values.message,
          admin: admin?.id,
        })
        .where(eq(applicationApprovals.id, application.approval))
        .returning()
        .execute();
    }

    const [approval] = await db
      .insert(applicationApprovals)
      .values({
        admin: admin?.id,
        approved: values.approve,
        message: values.message,
      })
      .returning()
      .execute();

    return db
      .update(applications)
      .set({ approval: approval.id })
      .where(eq(applications.id, values.applicationId))
      .returning()
      .execute();
  },
);

export const rotue = {
  load: () => applicationsQuery(),
};

const approvalSchema = z.object({
  message: z.string(),
});

type approvalFormType = z.infer<typeof approvalSchema>;

export default function Applications() {
  const applicationsAsync = createAsync(() => applicationsQuery());

  const [applicationId, setApplicationId] = createSignal<string | null>(null);
  const selectedApplication = createMemo(() => {
    if (!applicationsAsync()) return;
    return applicationsAsync()!.find((ap) => ap.id === applicationId());
  });

  createEffect(() => {
    setValues(approvalForm, {
      message: selectedApplication()?.approval?.message ?? "",
    });
  });

  const [approvalForm, { Form, Field }] = createForm<approvalFormType>({
    validate: zodForm(approvalSchema),
  });

  const toggleApprovalAction = useAction(toggleApproval);
  const toggleApprovalSubmission = useSubmission(toggleApproval);
  async function onSubmit(approve: boolean) {
    const values = getValues(approvalForm);

    await toggleApprovalAction({
      message: values.message ?? "",
      approve,
      applicationId: applicationId() ?? "",
    });

    setApplicationId(null);
  }

  const detailInfo: {
    name: string;
    accessor: string;
  }[] = [
    { name: "Имя", accessor: "user.fullname" },
    { name: "Телефон", accessor: "user.phone" },
    { name: "Подтвержден", accessor: "approval.approved" },
  ];

  return (
    <div>
      <Table>
        <TableCaption>Заявки на подтверждение</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Время</TableHead>
          </TableRow>
        </TableHeader>
        <Show
          when={applicationsAsync()}
          fallback={<p class="text-center">Загрузка...</p>}
        >
          <TableBody>
            <For each={applicationsAsync()}>
              {(ap) => (
                <TableRow
                  onClick={() => setApplicationId(ap.id)}
                  class="cursor-pointer"
                  classList={{
                    "bg-green-100": ap.approval?.approved,
                    "bg-red-100": !!ap.approval && !ap.approval?.approved,
                  }}
                >
                  <TableCell class="font-medium">{ap.user?.fullname}</TableCell>
                  <TableCell>{ap.user?.phone}</TableCell>
                  <TableCell>{dayjs(ap.timeStart).format("DD MMMM")}</TableCell>
                  <TableCell>
                    {dayjs(ap.timeStart).format("HH:MM")} -{" "}
                    {dayjs(ap.timeEnd).format("HH:MM")}
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Show>
      </Table>
      <Portal>
        <Show when={!!applicationId()}>
          <div
            class="fixed inset-0"
            onClick={() => setApplicationId(null)}
          ></div>
        </Show>
      </Portal>
      <Portal>
        <div
          class="fixed bottom-0 right-0 top-0 min-w-[1000px] translate-x-full space-y-8 bg-slate-50 p-6 shadow transition-transform"
          classList={{ "!translate-x-0": !!applicationId() }}
        >
          <h1 class="text-2xl text-slate-800">
            Ответ на заявку #{selectedApplication()?.id}
          </h1>
          <div class="space-y-2 text-slate-500">
            <For each={detailInfo}>
              {(row) => (
                <div class="flex items-center">
                  <p class="w-[150px]">{row.name}: </p>
                  <p>
                    {"" + objectPath.get(selectedApplication()!, row.accessor)}
                  </p>
                </div>
              )}
            </For>
          </div>
          <Form class="space-y-4" onSubmit={() => {}}>
            <Field name="message">
              {(field, props) => (
                <TextInput
                  {...props}
                  type="text"
                  label="Ответ"
                  value={field.value}
                  error={field.error}
                  required
                />
              )}
            </Field>
            <div class="mb-6 flex max-w-[300px] space-x-4">
              <Button
                color="red"
                onClick={() => onSubmit(false)}
                loading={toggleApprovalSubmission.pending}
              >
                Отклонить
              </Button>
              <Button
                onClick={() => onSubmit(true)}
                loading={toggleApprovalSubmission.pending}
              >
                Согласовать
              </Button>
            </div>
          </Form>
        </div>
      </Portal>
    </div>
  );
}
