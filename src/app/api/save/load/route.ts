import { NextResponse } from "next/server";
import { SaveController } from "@controllers/Save";

export async function GET() {
  try {
    const data = await new SaveController().read();
    return NextResponse.json({ response: data }, { status: 200 });
  } catch (e: any) {
    console.error("Erreur lors du traitement de la requête:", e);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre requête." },
      { status: 500 },
    );
  }
}
