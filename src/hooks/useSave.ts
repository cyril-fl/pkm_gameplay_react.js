import { useEffect, useState } from "react";
import { SaveModel } from "@models/Save";

export const useSave = () => {
  const [data, setData] = useState<SaveModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Drapeau pour vérifier si le composant est monté

    const fetchData = async () => {
      try {
        const response = await fetch("/api/save/load", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (isMounted) {
          setData(data.response);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message);
        }
        console.error("Error fetching save data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData().catch((error) => {
      console.error("Error during fetchData execution:", error);
    });

    // Nettoyage de l'effet
    return () => {
      isMounted = false;
    };
  }, []); // Dépendances

  return { data, loading, error };
};
