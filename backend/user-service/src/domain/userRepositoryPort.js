class UserRepositoryPort {

    async create(user) {
        throw new Error('Método create no implementado');
    }

    async findAll() {
        throw new Error('Método findAll no implementado');
    }

    async findByEmail(email) {
        throw new Error('Método findByEmail no implementado');
    }

    async update(id, user) {
        throw new Error('Método update no implementado');
    }

    async delete(id) {
        throw new Error('Método delete no implementado');
    }
}

module.exports = UserRepositoryPort;