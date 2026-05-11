import { NextResponse } from "next/server";
import { z } from "zod";
import { addFollowUpLog, updateLetterStatus } from "@/services/letters";
import { verifySession } from "@/services/users";

const followUpSchema = z.object({
  to_user: z.string().min(2, "Tujuan tindak lanjut wajib diisi."),
  note: z.string().min(4, "Catatan tindak lanjut wajib diisi."),
  status: z.enum(["Baru", "Diproses", "Selesai"]),
});

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const session = await verifySession();
  const { id } = await params;
  const body = await request.json();
  const parsed = followUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data tindak lanjut tidak valid." },
      { status: 400 },
    );
  }

  const log = await addFollowUpLog({
    suratId: id,
    fromUser: session.name,
    toUser: parsed.data.to_user,
    note: parsed.data.note,
    status: parsed.data.status,
  });

  await updateLetterStatus(id, parsed.data.status);

  return NextResponse.json({ data: log }, { status: 201 });
}
