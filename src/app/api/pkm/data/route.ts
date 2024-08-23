import { NextResponse } from "next/server";
import { DatabaseController } from "@controllers/Database";

export async function GET() {
  try {
    const db = await DatabaseController.connect();
    const dex = await db.all(`
      SELECT
          p.*,
          GROUP_CONCAT(m.name || ' - ' || m.damage || ' - ' || m.crit_success || ' - ' || m.crit_fail || ' - ' ||t.id, ', ') AS moves
      FROM
          Pkms p
            JOIN Join_Pkms_on_Moves jpj ON p.id = jpj.pkm_id
            JOIN Moves m ON jpj.move_id = m.id
            JOIN Types t ON m.type_id = t.id
      GROUP BY
          p.id, p.name;
      `);
    const types = await db.all("SELECT * FROM Types");

    const typesMap = new Map(types.map((type) => [type.id, type]));
    const transformedDex = dex.map((pokemon) => {

      const pkmTypesIds = [Number(pokemon.type_1), Number(pokemon.type_2)];


      pokemon.moves = pokemon.moves.split(", ").map((move: any) =>{
        const temp = move.split(" - ")
        return {
          name: temp[0],
          damage: temp[1],
          crit : {success: temp[2], fail: temp[3]},
          type: typesMap.get(Number(temp[4]))}
      });

      // Associer les types aux détails
      const pokemonTypes = pkmTypesIds
        .map((id: any) => typesMap.get(id))
        .filter((type: any) => type !== undefined);

      delete pokemon.type_1;
      delete pokemon.type_2;

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
/*


const typesMap = new Map(types.map((type) => [type.id, type]));



const transformedDex = dex.map((pokemon) => {
  // Convertir la chaîne de types en tableau d'identifiants

  const typeIds = [pokemon.type_1, pokemon.type_2]
  // Associer les types aux détails
  const pokemonTypes = typeIds.map((typeId) => typesMap.get(typeId));
*/
