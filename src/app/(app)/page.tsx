import { Card, LinkButton, Page } from "@/components/ui";
import { getMessages } from "@/lib/i18n/server";

export default async function Home() {
  const { m } = await getMessages();
  return (
    <Page className="gap-8 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold leading-tight">{m.home.title}</h1>
        <p className="text-lg text-muted">{m.home.body}</p>
      </header>

      <div className="flex flex-col gap-3">
        <LinkButton href="/checkin">{m.home.start}</LinkButton>
        <LinkButton href="/exercises" variant="secondary">
          {m.home.exercises}
        </LinkButton>
      </div>

      <Card>
        <h2 className="font-semibold">{m.home.howTitle}</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-muted">
          {m.home.how.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="font-semibold">{m.home.privacyTitle}</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted">
          {m.home.privacy.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Card>
    </Page>
  );
}
