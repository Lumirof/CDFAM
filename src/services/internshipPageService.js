const AppError = require('../utils/appError');
const internshipPageRepository = require('../repositories/internshipPageRepository');

const LIMITE_TEXTO = 5000;

async function buscar() {
    const pagina = await internshipPageRepository.buscar();

    if (!pagina) {
        throw new AppError('Texto de apresentação não encontrado.', 404);
    }
    return pagina;
}

async function atualizar(entrada, administradorId) {
    if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
        throw new AppError('Os dados da página são obrigatórios.', 400);
    }

    const texto = typeof entrada.texto_introducao === 'string'
        ? entrada.texto_introducao.trim()
        : '';

    if (!texto) {
        throw new AppError('O texto de apresentação é obrigatório.', 400);
    }

    if (texto.length > LIMITE_TEXTO) {
        throw new AppError(
            `O texto de apresentação deve ter no máximo ${LIMITE_TEXTO} caracteres.`,
            400
        );
    }

    await internshipPageRepository.salvar({
        texto_introducao: texto,
        atualizado_por: administradorId
    });

    return await buscar();
}

module.exports = { buscar, atualizar };