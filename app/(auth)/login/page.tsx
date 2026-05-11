import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/beranda");
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef5ff_100%)]">
      <section className="hidden flex-1 p-10 lg:flex">
        <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,.12),_transparent_34%),linear-gradient(135deg,#ffffff,#f8fbff_55%,#eef6ff)] p-10 shadow-2xl shadow-slate-200/70">
          <div className="data-grid absolute inset-0 opacity-60" />
          <div className="relative z-10">
            <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
              SIPERSUM Kecamatan Kedungwuni
            </div>
            <h1 className="mt-8 max-w-xl font-display text-5xl font-semibold leading-tight text-slate-900">
              Pengelolaan surat masuk kecamatan yang cepat, rapi, dan cerdas.
            </h1>
            {/* <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Upload surat, ekstraksi OCR, klasifikasi AI, disposisi, dan arsip
              digital dalam satu dashboard modern untuk admin dan pimpinan.
            </p> */}
          </div>
          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            {[
              "OCR untuk scan JPG/PNG dan PDF berbasis teks",
              "Auto-fill data surat dengan parsing AI",
              "Pencatatan tindak lanjut dan laporan surat",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm shadow-slate-200/60"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="glass-panel w-full max-w-md rounded-[2rem] border border-white bg-white/95 p-8 shadow-2xl shadow-slate-200/80">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Internal Kecamatan
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
              Masuk ke SIPERSUM
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Gunakan akun internal untuk mengakses sistem database surat masuk kecamatan.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
