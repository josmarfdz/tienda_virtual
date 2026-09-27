class User {
    constructor(
        id,
        nombre,
        email,
        passwordHash,
        rol = 'cliente'
    ) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.passwordHash = passwordHash;
        this.rol = rol;
    }
}

module.exports = User;