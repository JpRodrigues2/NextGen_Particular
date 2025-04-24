function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');

    
}
