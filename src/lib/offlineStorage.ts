import { Transaction } from '@/types/transaction';

const DB_NAME = 'ScroogeOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';
const PENDING_STORE_NAME = 'pendingTransactions';

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create transactions store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: '_id' });
          store.createIndex('date', 'date', { unique: false });
        }

        // Create pending transactions store (for offline-created transactions)
        if (!db.objectStoreNames.contains(PENDING_STORE_NAME)) {
          const pendingStore = db.createObjectStore(PENDING_STORE_NAME, { keyPath: 'tempId' });
          pendingStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction_db = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction_db.objectStore(STORE_NAME);
      const request = store.put(transaction);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async savePendingTransaction(transaction: Omit<Transaction, '_id'> & { tempId: string }): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction_db = this.db!.transaction([PENDING_STORE_NAME], 'readwrite');
      const store = transaction_db.objectStore(PENDING_STORE_NAME);
      const request = store.put(transaction);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transactions = request.result.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        resolve(transactions);
      };
    });
  }

  async getPendingTransactions(): Promise<(Omit<Transaction, '_id'> & { tempId: string })[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PENDING_STORE_NAME], 'readonly');
      const store = transaction.objectStore(PENDING_STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removePendingTransaction(tempId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PENDING_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE_NAME);
      const request = store.delete(tempId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME, PENDING_STORE_NAME], 'readwrite');
      const store1 = transaction.objectStore(STORE_NAME);
      const store2 = transaction.objectStore(PENDING_STORE_NAME);
      
      const request1 = store1.clear();
      const request2 = store2.clear();

      let completed = 0;
      const onComplete = () => {
        completed++;
        if (completed === 2) resolve();
      };

      request1.onerror = request2.onerror = () => reject(request1.error || request2.error);
      request1.onsuccess = request2.onsuccess = onComplete;
    });
  }
}

export const offlineStorage = new OfflineStorage();