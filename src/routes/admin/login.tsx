import {
  createForm,
  FormError,
  SubmitHandler,
  zodForm,
} from "@modular-forms/solid";
import { z } from "zod";
import { TextInput } from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";
import { action, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { db } from "~/db";
import { admins, sessions } from "~/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { setCookie } from "vinxi/http";

const submitForm = action(async (form: z.infer<typeof loginFormSchema>) => {
  "use server";

  const [user] = await db
    .select()
    .from(admins)
    .where(eq(admins.name, form.login))
    .execute();
  if (!user) return new Error("Неправильный логин");

  const [existedSession] = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.adminId, user.id), gt(sessions.expiresAt, Date.now())),
    )
    .execute();
  if (existedSession) {
    setCookie("__sessionId", existedSession.id);

    return { message: "ok" };
  }

  const [session] = await db
    .insert(sessions)
    .values({
      id: nanoid(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
      adminId: user.id,
    })
    .returning()
    .execute();

  setCookie("__sessionId", session.id);

  return { message: "ok" };
});

const loginFormSchema = z.object({
  login: z.string(),
});

export default function Login() {
  const [loginForm, { Form, Field }] = createForm<
    z.infer<typeof loginFormSchema>
  >({
    validate: zodForm(loginFormSchema),
  });

  const submitFormAction = useAction(submitForm);
  const submitFormSubmission = useSubmission(submitForm);

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<z.infer<typeof loginFormSchema>> = async (
    values,
  ) => {
    const res = await submitFormAction(values);
    if (res instanceof Error) {
      throw new FormError<z.infer<typeof loginFormSchema>>("Ошибка", {
        login: res.message,
      });
    }

    navigate("/admin/applications");
  };

  return (
    <div class="fixed inset-0 flex items-center justify-center">
      <Form onSubmit={onSubmit} class="">
        <h1 class="mb-2 text-center text-3xl text-slate-800">Вход в кабинет</h1>
        <p class="mb-6 text-slate-600">
          Введите логин, который вам выдал администратор сайта
        </p>
        <Field name="login">
          {(field, props) => (
            <TextInput
              {...props}
              type="text"
              label="Логин"
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>
        <Button class="mt-2" loading={submitFormSubmission.pending}>
          Войти
        </Button>
      </Form>
    </div>
  );
}
