/*
import { useEffect, useState } from "react";

export const usePkDex = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching Pokémon data");
      try {
        const response = await fetch("/api/pkm/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "max-age=31536000, immutable",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Pokémon data");
        }

        const result = await response.json();
        setData(result.response);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        setData([]); // Optionally set empty array on error
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render

  return data;
};
*/
