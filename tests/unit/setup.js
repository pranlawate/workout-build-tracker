// Mock localStorage for Node.js test environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = String(value);
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
  get length() {
    return Object.keys(this.data).length;
  },
  key(index) {
    return Object.keys(this.data)[index] || null;
  }
};
