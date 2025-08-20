class StorageService {
  constructor() {
    this.dbConfig = {
      databaseName: 'version-1-msoutlook-db',
      version: 1,
      stores: [
        {
          name: 'users',
          id: { keyPath: 'id', autoIncrement: false },
          indices: [
            { name: 'token', keypath: 'token', options: { unique: false } },
            { name: 'userid', keypath: 'userid', options: { unique: false } },
            { name: 'crm_url', keypath: 'crm_url', options: { unique: false } },
            { name: 'username', keypath: 'username', options: { unique: false } },
          ],
        },
      ],
    };
    this.dbName = 'version-1-msoutlook-db';
    this.version = 1;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      console.log('StorageService: Opening database...');
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('StorageService: Error opening database:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log('StorageService: Database opened successfully');
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('StorageService: Database upgrade needed');
        const db = event.target.result;
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id' });
          store.createIndex('token', 'token', { unique: false });
          store.createIndex('userid', 'userid', { unique: false });
          store.createIndex('crm_url', 'crm_url', { unique: false });
          store.createIndex('username', 'username', { unique: false });
          console.log('StorageService: Users store created');
        }
      };
    });
  }

  async getUser() {
    try {
      console.log('StorageService: Getting user from database...');
      const db = await this.openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        // First try to get user with ID 1
        const request = store.get(1);
        
        request.onerror = () => {
          console.error('StorageService: Error getting user with ID 1:', request.error);
          // If that fails, try to get any user from the store
          this.getAnyUser(store).then(resolve).catch(reject);
        };
        
        request.onsuccess = () => {
          const user = request.result;
          if (user) {
            console.log('StorageService: Retrieved user from DB with ID 1');
            resolve(user);
          } else {
            console.log('StorageService: No user found with ID 1, trying to get any user...');
            // If no user with ID 1, try to get any user
            this.getAnyUser(store).then(resolve).catch(reject);
          }
        };
        
        transaction.onerror = () => {
          console.error('StorageService: Transaction error:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('StorageService: Error getting user:', error);
      return null;
    }
  }

  async getAnyUser(store) {
    return new Promise((resolve, reject) => {
      console.log('StorageService: Attempting to get any user from store...');
      const request = store.getAll();
      
      request.onerror = () => {
        console.error('StorageService: Error getting all users:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const users = request.result;
        console.log('StorageService: Found', users.length, 'users in database');
        
        if (users && users.length > 0) {
          const user = users[0]; // Get the first user
          console.log('StorageService: Retrieved first user from DB');
          resolve(user);
        } else {
          console.log('StorageService: No users found in database');
          resolve(null);
        }
      };
    });
  }

  async saveUser(userData) {
    try {
      console.log('StorageService: Saving user to database...');
      
      const db = await this.openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        // Clear any existing users first to ensure clean state
        const clearRequest = store.clear();
        
        clearRequest.onerror = () => {
          console.error('StorageService: Error clearing existing users:', clearRequest.error);
          reject(clearRequest.error);
        };
        
        clearRequest.onsuccess = () => {
          console.log('StorageService: Cleared existing users, saving new user...');
          
          const userDataWithId = {
            id: 1,
            ...userData,
          };

          const saveRequest = store.put(userDataWithId);
          
          saveRequest.onerror = () => {
            console.error('StorageService: Error saving user:', saveRequest.error);
            reject(saveRequest.error);
          };
          
          saveRequest.onsuccess = () => {
            console.log('StorageService: User saved successfully to IndexedDB');
            resolve(saveRequest.result);
          };
        };
        
        // Handle transaction completion
        transaction.oncomplete = () => {
          console.log('StorageService: Save transaction completed successfully');
        };
        
        transaction.onerror = () => {
          console.error('StorageService: Transaction error during save:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('StorageService: Error saving user:', error);
      throw error;
    }
  }

  async deleteUser() {
    try {
      console.log('StorageService: Deleting user from database...');
      const db = await this.openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        // Clear all users to ensure complete cleanup
        const request = store.clear();
        
        request.onerror = () => {
          console.error('StorageService: Error deleting users:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          console.log('StorageService: All users deleted successfully from IndexedDB');
          resolve(request.result);
        };
        
        transaction.onerror = () => {
          console.error('StorageService: Transaction error during delete:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('StorageService: Error deleting user:', error);
      throw error;
    }
  }

  getDbConfig() {
    return this.dbConfig;
  }
}

export default new StorageService();