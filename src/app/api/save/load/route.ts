import { NextResponse } from "next/server";
import { SaveController } from "@controllers/Save";

export async function GET() {
  try {
    const temp = await new SaveController()
    const data = await temp.read();
    return NextResponse.json({ response: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre requête." },
      { status: 500 },
    );
  }
}
