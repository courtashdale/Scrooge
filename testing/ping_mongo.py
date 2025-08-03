from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Replace this with your updated connection string
uri = "mongodb+srv://courtsaiaccounts:g88DsQkbLHiuZvu@cluster0.dx52fok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
db_name = "scrooge"
collection_name = "collection_1"


def test_connection():
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        print("✅ Connected to MongoDB Atlas!")

        db = client[db_name]
        collection = db[collection_name]
        doc = collection.find_one()

        if doc:
            print("📄 Found a document:", doc)
        else:
            print("⚠️ No documents found in collection.")

    except Exception as e:
        print("❌ Connection failed:", e)
    finally:
        client.close()
        print("🔌 Connection closed.")


if __name__ == "__main__":
    test_connection()
