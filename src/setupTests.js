import '@testing-library/jest-dom';

// Mock global de indexedDB para Jest
class IDBRequestMock {
  constructor() {
    this.result = {}; // Puedes ajustar según lo que tu código espere
    this.onerror = null;
    this.onsuccess = null;
    this.onupgradeneeded = null;
  }
}

class IDBMock {
  open() {
    return new IDBRequestMock();
  }
}

global.indexedDB = new IDBMock();
