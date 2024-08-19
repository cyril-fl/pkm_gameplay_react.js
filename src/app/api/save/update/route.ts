import { NextResponse } from "next/server";
import { SaveController } from "@controllers/Save";

export async function PUT(req: any) {
    console.log("------ PUT -----");
    try {
        const data = await req.json();
        console.log('Received data:', data);
        const save = await new SaveController().update(data);
        console.log("save", save);
        return NextResponse.json({ response: save }, { status: 200 });
    } catch (e: any) {
        console.error("Erreur lors du traitement de la requête:", e);
        return NextResponse.json(
            { error: "Une erreur est survenue lors du traitement de votre requête." },
            { status: 500 },
        );
    }
}
