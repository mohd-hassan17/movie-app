import { Client, Databases, ID, Query } from "appwrite";
import { type Models } from "appwrite";


const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

type MovieResult = {
  id: number;          // or string if you cast it
  poster_path?: string | null;
  // add any other fields you actually use later
};

export const updateSearchCount = async (searchMovie: string, movie: MovieResult) => {

  // 1. Use Appwrite SDK to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchMovie', searchMovie)
        ])

         // 2. If it does, update the count
         if(result.documents.length > 0){
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
              // 3. If it doesn't, create a new document with the search term and count as 1
         } else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchMovie,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
         }


    } catch (error) {
        console.error(error)
    }
    
}


type MovieDocument = Models.Document & {
  searchTerm: string;
  count: number;
  movie_id: number;
  poster_url: string;
  title: string
};

export const getTrendingMovies = async (): Promise<MovieDocument[]> => {
  try {
    const result = await database.listDocuments<MovieDocument>(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.limit(5),
        Query.orderDesc("count"),
      ]
    );
    return result.documents;
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    return []; // ✅ always return an array to avoid `undefined`
  }
};