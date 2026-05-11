import { NextResponse } from "next/server";
import { updateLetterStatus } from "@/services/letters";
import { verifySession } from "@/services/users";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["Baru", "Diproses", "Selesai"]),
});

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  await verifySession("admin");
  const { id } = await params;
  const body = await request.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Status surat tidak valid." },
      { status: 400 },
    );
  }

  const updated = await updateLetterStatus(id, parsed.data.status);
  return NextResponse.json({ data: updated });
}
