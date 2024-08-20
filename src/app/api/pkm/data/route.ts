import { NextResponse } from "next/server";
import { DatabaseController } from "@controllers/Database";

export async function GET() {
  try {
    const db = await DatabaseController.connect();
    const dex = await db.all("SELECT * FROM Pkms");
    const types = await db.all("SELECT * FROM Types");

    const typesMap = new Map(types.map((type) => [type.id, type]));
    const transformedDex = dex.map((pokemon) => {
      // Convertir la chaîne de types en tableau d'identifiants
      const typeIds = pokemon.types.split(",").map(Number);

      // Associer les types aux détails
      const pokemonTypes = typeIds
        .map((id: any) => typesMap.get(id))
        .filter((type: any) => type !== undefined);

      return {
        ...pokemon,
        types: pokemonTypes,
      };
    });

    return NextResponse.json({ response: transformedDex }, { status: 200 });
  } catch (e: any) {
    console.error("Erreur lors du traitement de la requête:", e);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre requête." },
      { status: 500 },
    );
  }
}
