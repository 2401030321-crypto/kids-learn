export default function Help() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-left">
      <h1 className="text-4xl font-extrabold text-primary mb-8">
        Help & Safety
      </h1>

      {/* Child Safety Guidelines */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          👶 Child Safety Guidelines (India)
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-lg">
          <li>
            Never share personal information like your full name, address,
            school name, phone number, or passwords.
          </li>
          <li>
            Do not talk to strangers online or offline without a parent’s
            permission.
          </li>
          <li>
            If anyone makes you feel scared, uncomfortable, or confused,
            tell a parent, teacher, or trusted adult immediately.
          </li>
          <li>
            Never share photos, videos, or messages with unknown people.
          </li>
          <li>
            Use chat and AI features kindly and respectfully.
          </li>
          <li>
            Remember: **It is NEVER your fault** if someone behaves badly
            with you.
          </li>
        </ul>
      </section>

      {/* Online Safety */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          🌐 Online Safety Tips
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-lg">
          <li>Log out after using shared devices.</li>
          <li>Do not click unknown links or pop-ups.</li>
          <li>Report anything that feels unsafe to a parent.</li>
        </ul>
      </section>

      {/* Helpline Numbers */}
      <section className="bg-muted/40 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">
          📞 Child Helpline Numbers (India)
        </h2>

        <div className="space-y-2 text-lg">
          <p>
            <strong>CHILDLINE (24×7):</strong>{" "}
            <span className="text-primary font-bold">1098</span>
          </p>
          <p>
            <strong>Emergency Services:</strong>{" "}
            <span className="text-primary font-bold">112</span>
          </p>
          <p>
            <strong>Women & Child Helpline:</strong>{" "}
            <span className="text-primary font-bold">181</span>
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          These helplines are supported by the Government of India and are
          free to call.
        </p>
      </section>
    </div>
  );
}
