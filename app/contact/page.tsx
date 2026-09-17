export const metadata = { title: "Contact | EARTGALLA" };

export default function ContactPage() {
  return (
    <div className="pt-32 px-6 md:px-10 pb-24 max-w-xl">
      <p className="label-mono text-ivory/50 mb-3">CONTACT</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-10">Get in Touch</h1>
      <form className="flex flex-col gap-5">
        <input required name="name" placeholder="Name" className="bg-transparent border-b border-ivory/30 py-3 outline-none focus:border-gold" />
        <input required type="email" name="email" placeholder="Email" className="bg-transparent border-b border-ivory/30 py-3 outline-none focus:border-gold" />
        <textarea required name="message" placeholder="Message" rows={5} className="bg-transparent border-b border-ivory/30 py-3 outline-none focus:border-gold" />
        <button type="submit" className="label-mono border border-ivory/30 rounded-full px-6 py-3 w-fit mt-4">
          Send
        </button>
      </form>
      <p className="text-ivory/40 label-mono mt-10">
        Form submission handling not yet wired to a backend — connect an API route or a
        service like Resend/Formspree before launch.
      </p>
    </div>
  );
}
