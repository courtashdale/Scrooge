import { MongoClient } from "mongodb";

// Replace with your MongoDB URI
const uri = "mongodb+srv://courtsaiaccounts:g88DsQkbLHiuZvu@cluster0.dx52fok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const dbName = "scrooge";
const collectionName = "collection_1";

async function testMongoConnection() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Ping the collection: just find one document
    const result = await collection.findOne();
    if (result) {
      console.log("📄 Found a document:", result);
    } else {
      console.log("⚠️ No documents found in collection.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  } finally {
    await client.close();
    console.log("🔌 Connection closed.");
  }
}

testMongoConnection();