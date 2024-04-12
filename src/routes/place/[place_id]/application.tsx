import { Portal } from "solid-js/web";
import {
  action,
  cache,
  createAsync,
  useAction,
  useNavigate,
  useParams,
  useSubmission,
} from "@solidjs/router";
import {
  createForm,
  FieldEvent,
  reset,
  SubmitHandler,
  toCustom,
  zodForm,
} from "@modular-forms/solid";
import { z } from "zod";
import { TextInput } from "~/components/ui/TextInput";
import { createInputMask } from "@solid-primitives/input-mask";
import Button from "~/components/ui/Button";
import { TextareaInput } from "~/components/ui/TextareaInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createMemo, createSignal, For } from "solid-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import TimeCard from "~/components/cards/TimeCard";
import { RiArrowRightLine, RiLoopLeftLine } from "solidjs-remixicon";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { applicationApprovals, applications, users } from "~/db/schema";
import { db } from "~/db";
import { RiSystemShieldCheckLine } from "solid-icons/ri";
import { Resend } from "resend";

dayjs.extend(relativeTime);

const applicationFormSchema = z.object({
  fullname: z.string(),
  vkLink: z.string().regex(/https:\/\/vk\.com\/\w/, {
    message: "Не соответствует формату https://vk.com/{user_name}",
  }),
  phone: z.string(),
  message: z.string().min(20, { message: "Слишком коротко" }),
});

// hardcoded
// move to db later
const emails = [
  "kozelvn@rgsu.net",
  "MerzlikinPS@rgsu.net",
  "BezliudnaiaDA@rgsu.net",
];

const submitApplication = action(
  async (
    submission: InferInsertModel<typeof applications> &
      InferInsertModel<typeof users>,
  ) => {
    "use server";
    const [user] = await db
      .insert(users)
      .values({
        phone: submission.phone,
        fullname: submission.fullname,
      })
      .returning()
      .execute();

    const application = await db
      .insert(applications)
      .values({
        place: submission.place,
        timeStart: submission.timeStart,
        timeEnd: submission.timeEnd,
        message: submission.message,
        user: user.id,
        approval: null,
      })
      .returning()
      .execute();

    const resend = new Resend(process.env.RESEND_TOKEN);
    await resend.emails.send({
      from: "noreply@booker.ru",
      to: emails,
      subject: "Новая заявка",
      html: "<p>Новая заявка</p>",
    });

    return application;
  },
);

const approvedApplications = cache(async (placeId: string) => {
  "use server";

  const res = await db
    .select()
    .from(applications)
    .innerJoin(
      applicationApprovals,
      eq(applications.approval, applicationApprovals.id),
    )
    .where(and(eq(applications.place, placeId)))
    .execute();

  return res.map((itm) => itm.applications);
}, "approvedApplications");

export default function Application() {
  const navigation = useNavigate();
  const params = useParams();

  const approvedApplicationsAsync = createAsync(() =>
    approvedApplications(params["place_id"]),
  );

  const applicationsTimes = createMemo(() => {
    if (!approvedApplicationsAsync())
      return {} as Record<string, [Dayjs, Dayjs][]>;

    const applicationsIntervalsByDays = {} as Record<string, [Dayjs, Dayjs][]>;

    for (const application of approvedApplicationsAsync()!) {
      const day = dayjs(application.timeStart).format("DD-MM");
      if (day in applicationsIntervalsByDays)
        applicationsIntervalsByDays[day].push([
          dayjs(application.timeStart),
          dayjs(application.timeEnd),
        ]);
      else
        applicationsIntervalsByDays[day] = [
          [dayjs(application.timeStart), dayjs(application.timeEnd)],
        ];
    }

    return applicationsIntervalsByDays;
  });

  const days = createMemo(() => {
    const amount = 14;
    const res = [] as [Dayjs, Dayjs[]][];

    const firstDay = dayjs();

    for (let i = 0; i < amount; i++) {
      const day = firstDay.add(i, "day").set("hour", 10).set("minutes", 0);

      const times = [];
      for (let j = 0; j < 11; j++) {
        times.push(day.add(j, "hour"));
      }
      res.push([day, times]);
    }

    return res;
  });

  const [tab, setTab] = createSignal("date");

  const [timeStart, setTimeStart] = createSignal<Dayjs | null>(null);
  const [timeEnd, setTimeEnd] = createSignal<Dayjs | null>(null);
  const [lastSetted, setLastSetted] = createSignal<"start" | "end" | null>(
    null,
  );

  const [accordionStep, setAccordionStep] = createSignal<string[]>([]);

  function onCheckTime(time: Dayjs) {
    if (
      (timeStart() && !time.isSame(timeStart(), "day")) ||
      (timeEnd() && !time.isSame(timeEnd(), "day"))
    ) {
      setTimeStart(null);
      setTimeEnd(null);

      setLastSetted(null);
    }

    const dayWithApproved = applicationsTimes()[time.format("DD-MM")];

    if (dayWithApproved) {
      if (
        dayWithApproved.some(
          ([st, ed]) => ed.isAfter(time) && ed.isBefore(timeEnd()),
        )
      ) {
        setTimeStart(time);
        setTimeEnd(null);

        setLastSetted("start");
        return;
      } else if (
        dayWithApproved.some(
          ([st, ed]) => ed.isAfter(timeStart()) && ed.isBefore(time),
        )
      ) {
        setTimeStart(time);
        setTimeEnd(null);
        setLastSetted("start");
        return;
      }
    }

    if (timeStart() === null) {
      setTimeStart(time);
      setLastSetted("start");
      return;
    }

    if (timeEnd() === null) {
      setTimeEnd(time);
      setLastSetted("end");
      return;
    }

    if (lastSetted() === "start" && time.isAfter(timeStart())) {
      setTimeEnd(time);
      setLastSetted("end");
    } else if (lastSetted() === "end") {
      setTimeStart(time);
      setLastSetted("start");

      if (time.isAfter(timeEnd())) setTimeEnd(null);
    }
  }

  const [applicationForm, { Form, Field }] = createForm<
    z.infer<typeof applicationFormSchema>
  >({ validate: zodForm(applicationFormSchema) });

  const phoneMask = createInputMask<FieldEvent>("+7 (999) 999 99-99");

  const submitApplicationAction = useAction(submitApplication);
  const submitApplicationSubmission = useSubmission(submitApplication);
  const onSubmit: SubmitHandler<z.infer<typeof applicationFormSchema>> = async (
    values,
    _event,
  ) => {
    await submitApplicationAction({
      message: values.message,
      timeStart: timeStart()?.format(),
      timeEnd: timeEnd()?.format(),
      fullname: values.fullname,
      phone: values.phone,
      place: params["place_id"],
    });

    resetForm();
    setTab("success");
  };

  function resetForm() {
    setTimeStart(null);
    setTimeEnd(null);

    reset(applicationForm);
  }

  return (
    <Portal>
      <div class="fixed inset-0">
        <div
          class="absolute inset-0 bg-black/40"
          onClick={() => navigation(`/place/${params["place_id"]}`)}
        ></div>
        <div class="absolute inset-0 pt-5 md:left-1/2 md:top-[80px] md:w-[600px] md:-translate-x-1/2">
          <Tabs value={tab()} onChange={setTab} class="flex h-full flex-col">
            <TabsList class="self-start">
              <TabsTrigger value="date">Время</TabsTrigger>
              <TabsTrigger value="data">Данные</TabsTrigger>
              <TabsTrigger class="hidden" value="success"></TabsTrigger>
            </TabsList>
            <TabsContent
              value="date"
              class="rounded-lg bg-white p-3 md:h-[unset] md:grow-0 md:p-6"
            >
              <h1 class="mb-4 text-2xl text-slate-700">
                Выберите время на которое вы хотите прийти
              </h1>
              <Accordion
                class="max-h-[500px] overflow-y-auto"
                value={accordionStep()}
                onChange={(value) => setAccordionStep(value)}
              >
                <For each={days()}>
                  {([date, times]) => (
                    <AccordionItem value={date.format("DD-MM")}>
                      <AccordionTrigger class="capitalize">
                        {date.format("dddd DD MMMM")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div class="flex flex-wrap gap-2">
                          <For each={times}>
                            {(time) => (
                              <TimeCard
                                selected={
                                  (timeStart() && time.isSame(timeStart())) ||
                                  (timeEnd() && time.isSame(timeEnd())) ||
                                  (time.isAfter(timeStart()) &&
                                    time.isBefore(timeEnd()))
                                }
                                disabled={
                                  applicationsTimes()![time.format("DD-MM")] &&
                                  applicationsTimes()![
                                    time.format("DD-MM")
                                  ].some(
                                    ([st, ed]) =>
                                      time.isAfter(st) && time.isBefore(ed),
                                  )
                                }
                                onClick={() => onCheckTime(time)}
                              >
                                {time.format("HH:MM")}
                                {/*{applicationsTimes()[time.format("DD-MM")]}*/}
                              </TimeCard>
                            )}
                          </For>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </For>
              </Accordion>
              <div class="flex items-center space-x-4">
                <Button
                  class="flex items-center justify-center space-x-2"
                  color="gray"
                  onClick={() => {
                    setTimeStart(null);
                    setTimeEnd(null);
                  }}
                >
                  <>
                    <RiLoopLeftLine></RiLoopLeftLine>
                    <span>Сбросить</span>
                  </>
                </Button>
                <Button
                  class="flex items-center justify-center space-x-2"
                  color="accent"
                  onClick={() => setTab("data")}
                >
                  <>
                    <span>Дальше</span>
                    <RiArrowRightLine></RiArrowRightLine>
                  </>
                </Button>
              </div>
            </TabsContent>
            <TabsContent
              value="data"
              class="relative flex grow flex-col rounded-lg bg-white p-3 md:h-[unset] md:grow-0 md:p-6"
            >
              <Form onSubmit={onSubmit} class="space-y-5">
                <Field name="fullname">
                  {(field, props) => (
                    <TextInput
                      {...props}
                      type="text"
                      label="ФИО"
                      value={field.value}
                      error={field.error}
                      required
                    />
                  )}
                </Field>
                <Field name="vkLink">
                  {(field, props) => (
                    <TextInput
                      {...props}
                      type="text"
                      label="Ссылка на вк"
                      value={field.value}
                      error={field.error}
                      required
                    />
                  )}
                </Field>
                <Field
                  name="phone"
                  transform={toCustom((_, event) => phoneMask(event), {
                    on: "input",
                  })}
                >
                  {(field, props) => (
                    <TextInput
                      {...props}
                      type="text"
                      label="Ваш телефон"
                      value={field.value}
                      error={field.error}
                      required
                    />
                  )}
                </Field>
                <Field name="message">
                  {(field, props) => (
                    <TextareaInput
                      {...props}
                      label="Цель"
                      value={field.value}
                      error={field.error}
                      required
                    />
                  )}
                </Field>
                <Button
                  loading={submitApplicationSubmission.pending}
                  class="mt-auto"
                >
                  Отправить форму
                </Button>
              </Form>
            </TabsContent>
            <TabsContent
              value="success"
              class="relative flex grow flex-col rounded-lg bg-white p-3 md:h-[unset] md:grow-0 md:p-6"
            >
              <RiSystemShieldCheckLine
                class="mx-auto mb-2 text-green-400"
                size="144px"
              ></RiSystemShieldCheckLine>
              <h1 class="mb-4 text-center text-3xl text-slate-800">
                Вы успешно отправили заявку
              </h1>
              <p class="text-center text-slate-500">
                Через некоторое время вам напишет организатор и подтвердит вашу
                запись
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Portal>
  );
}
